import uvicorn
import os
from fastapi import FastAPI
from router import router as api_router
from logging_config import setup_logging, get_logger

setup_logging()
logger = get_logger(__name__)

app = FastAPI(title="Vanna AI Service")

app.include_router(api_router)

@app.on_event("startup")
def on_startup():
    logger.info("Vanna AI Service starting up...")

@app.get("/")
def read_root():
    logger.info("Root endpoint hit (health check).")
    return {"message": "Vanna AI service is running."}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting server on 0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)