from sqlalchemy import create_engine
import os
import pandas as pd
from groq import Groq
from vanna.openai import OpenAI_Chat
from vanna.chromadb import ChromaDB_VectorStore
from config import GROQ_API_KEY, GROQ_MODEL, DB_CONN_PARAMS, DATABASE_URL
from logging_config import get_logger

logger = get_logger(__name__)

#--- Database Connection Pool ---
try:
    logger.info("Creating SQLAlchemy engine...")

    # Get the URL from your config
    db_url = DATABASE_URL

    # IMPORTANT: SQLAlchemy needs "postgresql://" not "postgres://"
    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    # SQLAlchemy's engine handles connection pooling automatically
    engine = create_engine(db_url)

    logger.info("SQLAlchemy engine created successfully.")
except Exception as e:
    logger.error(f"Error creating SQLAlchemy engine: {e}", exc_info=True)
    raise

def run_sql_query(sql: str):
    """
    Runs a SQL query against the database using the SQLAlchemy engine.
    """
    try:
        # Use pandas.read_sql_query with the SQLAlchemy engine
        # This is the officially supported method.
        df = pd.read_sql_query(sql, engine)
        return df

    except Exception as e:
        logger.error(f"SQL execution error for query: {sql}", exc_info=True)
        raise Exception(f"SQL execution error: {str(e)}")

# --- Custom Vanna Class ---
class MyVanna(ChromaDB_VectorStore, OpenAI_Chat):
    def __init__(self, config=None):
        ChromaDB_VectorStore.__init__(self, config=config)
        self.groq_client = Groq(api_key=config['groq_api_key'])
        self.groq_model = config.get('groq_model', GROQ_MODEL)

    def submit_prompt(self, prompt, **kwargs):
        try:
            # --- FIX 2 & 3: Fix Groq 400 Error AND Preserve History ---
            valid_messages = []
            if isinstance(prompt, list) and len(prompt) > 1:
                # Vanna builds a prompt: [system_msg, user_msg_1, assistant_msg_1, ..., user_msg_N]

                # Combine the system prompt (prompt[0]) and the *first* user prompt (prompt[1])
                # This fixes the Groq "must start with role:user" error.
                system_content = prompt[0].get('content', '')
                first_user_content = prompt[1].get('content', '')
                combined_first_message = f"{system_content}\n\n{first_user_content}"

                valid_messages.append({"role": "user", "content": combined_first_message})

                # Add all remaining messages (the chat history).
                # This allows the AI to learn from its past (e.g., to use double quotes).
                for msg in prompt[2:]:
                    if isinstance(msg, dict) and 'content' in msg and msg['content']:
                        valid_messages.append({
                            "role": msg.get('role', 'user'), # Keep original role
                            "content": str(msg['content'])
                        })

            elif isinstance(prompt, str):
                # Fallback for a simple string prompt
                valid_messages.append({"role": "user", "content": prompt})

            else:
                # Fallback for any other unexpected format
                content = str(prompt[0].get('content', '')) if isinstance(prompt, list) and len(prompt) > 0 else str(prompt)
                valid_messages.append({"role": "user", "content": content})

            if not valid_messages:
                valid_messages = [{"role": "user", "content": "Generate SQL query"}]
            # --- END OF FIX ---

            logger.info(f"Submitting prompt to Groq model {self.groq_model}...")
            response = self.groq_client.chat.completions.create(
                model=self.groq_model,
                messages=valid_messages,
                temperature=0.1
            )
            logger.info("Groq response received.")
            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"Groq API error: {e}", exc_info=True)
            raise

# --- CORRECTED DDL STATEMENTS (to match schema.prisma) ---
DDL_STATEMENTS = [
    # ... (Keep your existing DDL_STATEMENTS array, it is correct) ...
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
logger.info(f"Initializing Vanna with Groq model {GROQ_MODEL}...")
vn = MyVanna(config={'groq_api_key': GROQ_API_KEY, 'groq_model': GROQ_MODEL})
vn.run_sql = run_sql_query
vn.run_sql_is_set = True

logger.info("Training Vanna on database schema (this may take a moment)...")
try:
    for ddl in DDL_STATEMENTS:
        vn.train(ddl=ddl)
    logger.info("Vanna DDL training complete!")
except Exception as e:
    logger.error(f"Vanna DDL training error: {e}", exc_info=True)

# --- !! NEW - ADD CUSTOM TRAINING !! ---
logger.info("Adding custom training data for quoting and case-insensitivity...")
try:
    # --- Teach it about quoting ---
    vn.train(
        question="Show overdue invoices as of today.",
        sql="SELECT i.\"id\", i.\"invoiceNumber\", i.\"invoiceDate\", p.\"dueDate\" FROM \"Invoice\" i JOIN \"Payment\" p ON i.\"id\" = p.\"invoiceId\" WHERE p.\"dueDate\" < CURRENT_DATE"
    )
    vn.train(
        question="What is the total spend?",
        sql="SELECT SUM(\"invoiceTotal\") FROM \"Invoice\";"
    )

    # --- Teach it about ILIKE (for case-insensitive search) ---
    vn.train(
        question="What is the total spend for Musterfirma Müller?",
        sql="SELECT SUM(i.\"invoiceTotal\") FROM \"Invoice\" i JOIN \"Vendor\" v ON i.\"vendorId\" = v.id WHERE v.name ILIKE 'Musterfirma Müller'"
    )
    vn.train(
        question="How many invoices does 'CPB SOFTWARE' have?",
        sql="SELECT COUNT(i.id) FROM \"Invoice\" i JOIN \"Vendor\" v ON i.\"vendorId\" = v.id WHERE v.name ILIKE 'CPB SOFTWARE%'"
    )
    logger.info("Custom training complete!")
except Exception as e:
    logger.error(f"Custom training error: {e}", exc_info=True)


# --- Export the singleton instance ---
vanna_service = vn
logger.info("Vanna service instance created and ready.")