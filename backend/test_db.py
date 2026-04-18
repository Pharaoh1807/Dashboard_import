import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()
client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
db = client.import_dashboard

async def run():
    files = await db.files.find({"user_id": {"$ne": None}}).to_list(length=None)
    print(f"Files with user_id: {len(files)}")
    if files:
        print(files[0])

asyncio.run(run())
