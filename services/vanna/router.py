from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models import ChatRequest
from vanna_instance import vanna_service # Import the trained instance
from logging_config import get_logger
import json

router = APIRouter()
logger = get_logger(__name__)

async def stream_response(question: str):
    """
    An async generator that yields different parts of the response.
    """
    try:
        logger.info(f"Received question: {question}")

        # Generate SQL from natural language question
        sql_query = vanna_service.generate_sql(question)
        logger.info(f"Generated SQL: {sql_query}")
        yield json.dumps({"type": "sql", "data": sql_query}) + "\n"

        # Execute the SQL query and get results
        df = vanna_service.run_sql(sql_query)
        logger.info(f"SQL execution successful, {len(df)} rows returned.")

        # Yield each row of the dataframe
        if df is not None:
            for _, row in df.iterrows():
                yield json.dumps({"type": "data", "data": row.to_dict()}) + "\n"
        
        yield json.dumps({"type": "done"}) + "\n"

    except Exception as e:
        logger.error(f"Error during chat processing: {e}", exc_info=True)
        yield json.dumps({"type": "error", "error": str(e)}) + "\n"

@router.post("/api/v1/chat")
async def chat(request: ChatRequest):
    """
    Accepts a question and returns a streaming response of the SQL query and its result.
    """
    return StreamingResponse(stream_response(request.question), media_type="application/x-ndjson")