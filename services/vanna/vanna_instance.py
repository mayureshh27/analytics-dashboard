import psycopg2
import pandas as pd
from groq import Groq
from vanna.openai import OpenAI_Chat
from vanna.chromadb import ChromaDB_VectorStore
from config import GROQ_API_KEY, GROQ_MODEL, DB_CONN_PARAMS, DATABASE_URL
from logging_config import get_logger

logger = get_logger(__name__)

from psycopg2.pool import SimpleConnectionPool
#--- Database Connection Pool ---
try:
    logger.info("Creating database connection pool...")
    # Use the DATABASE_URL directly for the pool
    db_pool = SimpleConnectionPool(
        minconn=1,
        maxconn=10,  # Allow up to 10 concurrent connections
        dsn=DATABASE_URL
    )
    logger.info("Database connection pool created successfully.")
except Exception as e:
    logger.error(f"Error creating database connection pool: {e}", exc_info=True)
    raise

def run_sql_query(sql: str):
    """
    Runs a SQL query against the database using a connection from the pool.
    """
    conn = None
    try:
        # Get a connection from the pool
        conn = db_pool.getconn()

        # Use pandas.read_sql_query with the new connection
        df = pd.read_sql_query(sql, conn)

        # This warning is normal, you can ignore it:
        # UserWarning: pandas only supports SQLAlchemy connectable...

        return df

    except Exception as e:
        logger.error(f"SQL execution error for query: {sql}", exc_info=True)
        # Rollback in case of error (optional but good practice)
        if conn:
            conn.rollback()
        raise Exception(f"SQL execution error: {str(e)}")

    finally:
        # IMPORTANT: Always return the connection to the pool
        if conn:
            db_pool.putconn(conn)

# --- Custom Vanna Class ---
class MyVanna(ChromaDB_VectorStore, OpenAI_Chat):
    def __init__(self, config=None):
        ChromaDB_VectorStore.__init__(self, config=config)
        self.groq_client = Groq(api_key=config['groq_api_key'])
        self.groq_model = config.get('groq_model', GROQ_MODEL)

    def submit_prompt(self, prompt, **kwargs):
        try:
            # ... (your existing submit_prompt logic, no changes needed) ...
            if isinstance(prompt, list):
                messages = prompt
            elif isinstance(prompt, str):
                messages = [{"role": "user", "content": prompt}]
            else:
                messages = [{"role": "user", "content": str(prompt)}]

            valid_messages = []
            for msg in messages:
                if isinstance(msg, dict) and 'content' in msg and msg['content']:
                    valid_messages.append({
                        "role": msg.get('role', 'user'),
                        "content": str(msg['content'])
                    })

            if not valid_messages:
                valid_messages = [{"role": "user", "content": "Generate SQL query"}]

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