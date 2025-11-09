import psycopg2
import pandas as pd
from groq import Groq
from vanna.openai import OpenAI_Chat
from vanna.chromadb import ChromaDB_VectorStore
from config import GROQ_API_KEY, GROQ_MODEL, DB_CONN_PARAMS

# --- Database Connection ---
try:
    # Establish a persistent connection
    db_conn = psycopg2.connect(**DB_CONN_PARAMS)
    print("Database connection successful.")
except Exception as e:
    print(f"Error connecting to database: {e}")
    # Exit or raise if DB connection fails
    raise

def run_sql_query(sql: str):
    """Runs a SQL query against the connected database."""
    try:
        df = pd.read_sql_query(sql, db_conn)
        return df
    except Exception as e:
        # Log the failed SQL for debugging
        print(f"SQL execution error for query: {sql}")
        raise Exception(f"SQL execution error: {str(e)}")

# --- Custom Vanna Class ---
class MyVanna(ChromaDB_VectorStore, OpenAI_Chat):
    """Custom Vanna class using Groq for LLM prompts."""
    def __init__(self, config=None):
        ChromaDB_VectorStore.__init__(self, config=config)
        self.groq_client = Groq(api_key=config['groq_api_key'])
        self.groq_model = config.get('groq_model', GROQ_MODEL)

    def submit_prompt(self, prompt, **kwargs):
        """Override submit_prompt to use Groq instead of OpenAI."""
        try:
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

# --- CORRECTED DDL STATEMENTS (to match schema.prisma) ---
DDL_STATEMENTS = [
    """
    CREATE TABLE "Vendor" (
                              id VARCHAR PRIMARY KEY,
                              name VARCHAR UNIQUE,
                              address VARCHAR,
                              "taxId" VARCHAR,
                              "partyNumber" VARCHAR
    )
    """,
    """
    CREATE TABLE "Customer" (
                                id VARCHAR PRIMARY KEY,
                                name VARCHAR UNIQUE,
                                address VARCHAR
    )
    """,
    """
    CREATE TABLE "Category" (
                                id VARCHAR PRIMARY KEY,
                                code VARCHAR UNIQUE
    )
    """,
    """
    CREATE TABLE "Invoice" (
                               id VARCHAR PRIMARY KEY,
                               "documentId" VARCHAR UNIQUE,
                               status VARCHAR,
                               "invoiceNumber" VARCHAR,
                               "invoiceDate" TIMESTAMP,
                               "deliveryDate" TIMESTAMP,
                               "subTotal" DECIMAL,
                               "totalTax" DECIMAL,
                               "invoiceTotal" DECIMAL,
                               "currencySymbol" VARCHAR,
                               "documentType" VARCHAR,
                               "vendorId" VARCHAR REFERENCES "Vendor"(id),
                               "customerId" VARCHAR REFERENCES "Customer"(id)
    )
    """,
    """
    CREATE TABLE "Payment" (
                               id VARCHAR PRIMARY KEY,
                               "dueDate" TIMESTAMP,
                               "paymentTerms" VARCHAR,
                               "bankAccountNumber" VARCHAR,
                               "invoiceId" VARCHAR UNIQUE REFERENCES "Invoice"(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE "LineItem" (
                                id VARCHAR PRIMARY KEY,
                                description VARCHAR,
                                quantity FLOAT,
                                "unitPrice" DECIMAL,
                                "totalPrice" DECIMAL,
                                "buKey" VARCHAR,
                                "invoiceId" VARCHAR REFERENCES "Invoice"(id) ON DELETE CASCADE,
                                "categoryId" VARCHAR REFERENCES "Category"(id)
    )
    """
]

# --- Initialize and Train Vanna ---
print("Initializing Vanna with Groq...")
vn = MyVanna(config={'groq_api_key': GROQ_API_KEY, 'groq_model': GROQ_MODEL})
vn.run_sql = run_sql_query
vn.run_sql_is_set = True

print("Training Vanna on database schema (this may take a moment)...")
try:
    # Train on all DDL statements
    for ddl in DDL_STATEMENTS:
        vn.train(ddl=ddl)
    print("Vanna training complete!")
except Exception as e:
    print(f"Vanna training error: {e}")
    # Depending on policy, you might want to raise here

# --- Export the singleton instance ---
vanna_service = vn