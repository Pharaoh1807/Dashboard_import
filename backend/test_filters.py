import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import pandas as pd
from dotenv import load_dotenv

load_dotenv()
client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
db = client.import_dashboard

from processor import DataProcessor

async def test():
    f = await db.files.find_one()
    if f:
        print("Got file", f['_id'])
        cursor = db.records.find({"file_id": f['_id']})
        records = await cursor.to_list(length=None)
        df = pd.DataFrame(records)
        processor = DataProcessor(df)
        print("Testing get_filter_options")
        try:
            filters = {"shipper": None, "origins": None, "years": None, "date_range": None}
            res = processor.get_filter_options(filters)
            print(res)
            print("Testing get_kpis")
            kpis = processor.get_kpis(filters)
            print(kpis)
            print("OK")
        except Exception as e:
            import traceback
            traceback.print_exc()
        
asyncio.run(test())
