from fastapi import APIRouter
from models import ChatRequest
from vanna_instance import vanna_service # Import the trained instance
from logging_config import get_logger

router = APIRouter()
logger = get_logger(__name__)

@router.post("/api/v1/chat")
async def chat(request: ChatRequest):
    """
    Accepts a question and returns a SQL query and its result.
    """
    try:
        logger.info(f"Received question: {request.question}")

        # Generate SQL from natural language question
        sql_query = vanna_service.generate_sql(request.question)
        logger.info(f"Generated SQL: {sql_query}")

        # Execute the SQL query and get results
        df = vanna_service.run_sql(sql_query)
        logger.info(f"SQL execution successful, {len(df)} rows returned.")

        # Convert dataframe to dictionary format
        data = df.to_dict('records') if df is not None else []

        return {
            "sql": sql_query,
            "data": data,
            "success": True
        }
    except Exception as e:
        logger.error(f"Error during chat processing: {e}", exc_info=True)
        return {
            "error": str(e),
            "success": False
        }