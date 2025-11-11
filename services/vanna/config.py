import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.environ['GROQ_API_KEY']
DATABASE_URL = os.environ['DATABASE_URL']
GROQ_MODEL = os.environ.get('llama-3.3-70b-versatile')

def get_db_connection_params():
    try:
        db_url = DATABASE_URL
        host_port = db_url.split('@')[1].split('/')[0]
        if ':' in host_port:
            host, port = host_port.rsplit(':', 1)
            port = int(port)
        else:
            host = host_port
            port = 5432

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

DB_CONN_PARAMS = get_db_connection_params()