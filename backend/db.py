import os
import logging
from pymongo import MongoClient

logger = logging.getLogger(__name__)

MONGO_URI = os.environ.get("MONGO_URI", "mongodb+srv://Deepfake:55N78H9PK6TqUebL@cluster0.uviff1m.mongodb.net/")

db_client = None

def get_db():
    global db_client
    if db_client is None:
        try:
            db_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
            db_client.admin.command('ping') # Force connection to verify server
            logger.info("Successfully connected to MongoDB.")
        except Exception as e:
            logger.warning(f"MongoDB is offline or unavailable. Running in fallback mode. Error: {e}")
            return None
            
    return db_client["deeptruth_ai"]

def get_contact_collection():
    database = get_db()
    if database is not None:
        return database["contact_messages"]
    return None
