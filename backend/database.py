import os
import motor.motor_asyncio
import certifi
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = motor.motor_asyncio.AsyncIOMotorClient(
    MONGODB_URL,
    tlsCAFile=certifi.where()
)
db = client.import_dashboard
