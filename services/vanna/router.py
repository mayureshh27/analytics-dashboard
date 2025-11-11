from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models import ChatRequest
from vanna_instance import vanna_service
from logging_config import get_logger

import json
import datetime
import decimal
import pandas as pd

router = APIRouter()
logger = get_logger(__name__)

async def stream_response(question: str):
    try:
        logger.info(f"Received question: {question}")

        sql_query = vanna_service.generate_sql(question)
        logger.info(f"Generated SQL: {sql_query}")
        yield json.dumps({"type": "sql", "data": sql_query}) + "\n"

        
        df = vanna_service.run_sql(sql_query)
        logger.info(f"SQL execution successful, {len(df)} rows returned.")

        
        if df is not None:
            for _, row in df.iterrows():
                row_dict = row.to_dict()
                
                yield json.dumps({"type": "data", "data": row_dict}, default=json_serial_helper) + "\n"
        
        yield json.dumps({"type": "done"}) + "\n"

    except Exception as e:
        logger.error(f"Error during chat processing: {e}", exc_info=True)
        yield json.dumps({"type": "error", "error": str(e)}) + "\n"

@router.post("/api/v1/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(stream_response(request.question), media_type="application/x-ndjson")

def json_serial_helper(obj):
    if isinstance(obj, (datetime.datetime, datetime.date, pd.Timestamp)):
        return obj.isoformat()

    if isinstance(obj, decimal.Decimal):
        return float(obj)

    raise TypeError(f"Type {type(obj)} not serializable")