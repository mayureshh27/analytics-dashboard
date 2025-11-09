import os
import uvicorn
from fastapi import FastAPI
from router import router as api_router

# Create the FastAPI app
app = FastAPI(title="Vanna AI Service")

# Include the API router
app.include_router(api_router)

@app.get("/")
def read_root():
    """Root endpoint to check if the service is running."""
    return {"message": "Vanna AI service is running."}

if __name__ == "__main__":
    # Get port from environment or default to 8000
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)