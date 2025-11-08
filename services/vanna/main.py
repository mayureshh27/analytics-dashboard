import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from vanna.openai import OpenAI_Chat
from vanna.chromadb import ChromaDB_VectorStore
import psycopg2
import pandas as pd
from groq import Groq

# Load environment variables from .env file
load_dotenv()

# Define the request body model
class ChatRequest(BaseModel):
    question: str

# Create a custom Vanna class with Groq LLM
class MyVanna(ChromaDB_VectorStore, OpenAI_Chat):
    def __init__(self, config=None):
        ChromaDB_VectorStore.__init__(self, config=config)
        # Don't init OpenAI_Chat as we'll override the submit_prompt method
        self.groq_client = Groq(api_key=config['groq_api_key'])
        self.groq_model = config.get('groq_model', 'llama3-70b-8192')
    
    def submit_prompt(self, prompt, **kwargs):
        """Override submit_prompt to use Groq instead of OpenAI"""
        try:
            # Handle both string prompts and message list formats
            if isinstance(prompt, list):
                messages = prompt
            elif isinstance(prompt, str):
                messages = [{"role": "user", "content": prompt}]
            else:
                messages = [{"role": "user", "content": str(prompt)}]
            
            # Ensure all messages have valid content
            valid_messages = []
            for msg in messages:
                if isinstance(msg, dict) and 'content' in msg and msg['content']:
                    valid_messages.append({
                        "role": msg.get('role', 'user'),
                        "content": str(msg['content'])
                    })
            
            if not valid_messages:
                valid_messages = [{"role": "user", "content": "Generate SQL query"}]
            
            response = self.groq_client.chat.completions.create(
                model=self.groq_model,
                messages=valid_messages,
                temperature=0.1
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Groq API error: {e}")
            raise

# Initialize Vanna with Groq
vn = MyVanna(config={
    'groq_api_key': os.environ['GROQ_API_KEY'],
    'groq_model': 'llama3-70b-8192'
})

# Parse DATABASE_URL for connection
db_url = os.environ['DATABASE_URL']
host_port = db_url.split('@')[1].split('/')[0]
if ':' in host_port:
    host, port = host_port.rsplit(':', 1)
    port = int(port)
else:
    host = host_port
    port = 5432

conn_params = {
    'host': host,
    'port': port,
    'database': db_url.split('/')[-1].split('?')[0],
    'user': db_url.split('://')[1].split(':')[0],
    'password': db_url.split('://')[1].split(':')[1].split('@')[0]
}

# Connect to PostgreSQL
conn = psycopg2.connect(**conn_params)

# Define a function to run SQL queries
def run_sql_query(sql: str):
    try:
        df = pd.read_sql_query(sql, conn)
        return df
    except Exception as e:
        raise Exception(f"SQL execution error: {str(e)}")

vn.run_sql = run_sql_query
vn.run_sql_is_set = True

# Train the model on the database schema
print("Training Vanna on database schema...")
try:
    # Add DDL training data
    vn.train(ddl="""
        CREATE TABLE Invoice (
            id VARCHAR PRIMARY KEY,
            invoiceId VARCHAR,
            invoiceDate TIMESTAMP,
            deliveryDate TIMESTAMP,
            subTotal FLOAT,
            totalTax FLOAT,
            invoiceTotal FLOAT,
            currencySymbol VARCHAR,
            documentType VARCHAR,
            status VARCHAR,
            vendorId VARCHAR REFERENCES Vendor(id),
            customerId VARCHAR REFERENCES Customer(id),
            paymentId VARCHAR REFERENCES Payment(id)
        )
    """)
    vn.train(ddl="""
        CREATE TABLE Vendor (
            id VARCHAR PRIMARY KEY,
            name VARCHAR,
            partyNumber VARCHAR,
            address VARCHAR,
            taxId VARCHAR
        )
    """)
    vn.train(ddl="""
        CREATE TABLE Customer (
            id VARCHAR PRIMARY KEY,
            name VARCHAR,
            address VARCHAR
        )
    """)
    vn.train(ddl="""
        CREATE TABLE Payment (
            id VARCHAR PRIMARY KEY,
            dueDate TIMESTAMP,
            paymentTerms VARCHAR,
            bankAccountNumber VARCHAR,
            bic VARCHAR,
            accountName VARCHAR,
            netDays INTEGER,
            discountPercentage FLOAT,
            discountDays INTEGER,
            discountDueDate TIMESTAMP,
            discountedTotal FLOAT
        )
    """)
    vn.train(ddl="""
        CREATE TABLE LineItem (
            id VARCHAR PRIMARY KEY,
            srNo INTEGER,
            description VARCHAR,
            quantity FLOAT,
            unitPrice FLOAT,
            totalPrice FLOAT,
            sachkonto VARCHAR,
            buSchluessel VARCHAR,
            invoiceId VARCHAR REFERENCES Invoice(id)
        )
    """)
    print("Training complete!")
except Exception as e:
    print(f"Training error: {e}")

# Create the FastAPI app
app = FastAPI()

@app.post("/api/v1/chat")
async def chat(request: ChatRequest):
    """
    Accepts a question and returns a SQL query and its result.
    """
    try:
        # Generate SQL from natural language question
        sql_query = vn.generate_sql(request.question)
        
        # Execute the SQL query and get results
        df = vn.run_sql(sql_query)
        
        # Convert dataframe to dictionary format
        data = df.to_dict('records') if df is not None else []
        
        return {
            "sql": sql_query,
            "data": data,
            "success": True
        }
    except Exception as e:
        return {
            "error": str(e),
            "success": False
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
