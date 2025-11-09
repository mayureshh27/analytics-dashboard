import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Environment Config ---
GROQ_API_KEY = os.environ['GROQ_API_KEY']
DATABASE_URL = os.environ['DATABASE_URL']
GROQ_MODEL = os.environ.get('GROQ_MODEL', 'llama-3.3-70b-versatile')

def get_db_connection_params():
    """Parses the DATABASE_URL into a dict for psycopg2."""
    try:
        db_url = DATABASE_URL
        host_port = db_url.split('@')[1].split('/')[0]
        if ':' in host_port:
            host, port = host_port.rsplit(':', 1)
            port = int(port)
        else:
            host = host_port
            port = 5432 # Default PostgreSQL port

        return {
            'host': host,
            'port': port,
            'database': db_url.split('/')[-1].split('?')[0],
            'user': db_url.split('://')[1].split(':')[0],
            'password': db_url.split('://')[1].split(':')[1].split('@')[0]
        }
    except Exception as e:
        print(f"Error parsing DATABASE_URL: {e}")
        raise

# Export the connection params
DB_CONN_PARAMS = get_db_connection_params()