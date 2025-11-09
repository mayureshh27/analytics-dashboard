import uvicorn
import os
from fastapi import FastAPI
from router import router as api_router
from logging_config import setup_logging, get_logger

# Set up logging first
setup_logging()
logger = get_logger(__name__)

# Create the FastAPI app
app = FastAPI(title="Vanna AI Service")

# Include the API router
app.include_router(api_router)

@app.on_event("startup")
def on_startup():
    logger.info("Vanna AI Service starting up...")

@app.get("/")
def read_root():
    """Root endpoint to check if the service is running."""
    logger.info("Root endpoint hit (health check).")
    return {"message": "Vanna AI service is running."}

if __name__ == "__main__":
    # Get port from environment or default to 8000
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting server on 0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)