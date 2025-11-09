import logging
import sys

def setup_logging():
    """Configures structured logging."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
            # You could also add a FileHandler here
            # logging.FileHandler("vanna_service.log")
        ]
    )
    # Silence overly verbose loggers from libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)

def get_logger(name: str):
    """Gets a logger instance."""
    return logging.getLogger(name)