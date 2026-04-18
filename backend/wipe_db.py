import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()
client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
db = client.import_dashboard

async def run():
    print("Deleting all old records and files...")
    f_res = await db.files.delete_many({})
    r_res = await db.records.delete_many({})
    print(f"Deleted {f_res.deleted_count} files and {r_res.deleted_count} records.")

asyncio.run(run())
