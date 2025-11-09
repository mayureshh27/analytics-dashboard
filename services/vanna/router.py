from fastapi import APIRouter
from models import ChatRequest
from vanna_instance import vanna_service # Import the trained instance

router = APIRouter()

@router.post("/api/v1/chat")
async def chat(request: ChatRequest):
    """
    Accepts a question and returns a SQL query and its result.
    """
    try:
        print(f"Received question: {request.question}")
        # Generate SQL from natural language question
        sql_query = vanna_service.generate_sql(request.question)
        print(f"Generated SQL: {sql_query}")

        # Execute the SQL query and get results
        df = vanna_service.run_sql(sql_query)

        # Convert dataframe to dictionary format
        data = df.to_dict('records') if df is not None else []

        return {
            "sql": sql_query,
            "data": data,
            "success": True
        }
    except Exception as e:
        print(f"Error during chat processing: {e}")
        return {
            "error": str(e),
            "success": False
        }