import asyncio
import os
import certifi
import motor.motor_asyncio
from auth import get_password_hash
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

async def create_admin():
    client = motor.motor_asyncio.AsyncIOMotorClient(
        MONGODB_URL,
        tlsCAFile=certifi.where()
    )
    db = client.import_dashboard
    
    username = input("Enter admin username: ")
    password = input("Enter admin password: ")
    
    existing = await db.users.find_one({"username": username})
    if existing:
        print(f"User {username} already exists. Updating role to admin and approving...")
        await db.users.update_one({"username": username}, {"$set": {"role": "admin", "is_approved": True}})
        print("Done.")
        return

    import uuid
    new_admin = {
        "_id": str(uuid.uuid4()),
        "username": username,
        "email": None,
        "hashed_password": get_password_hash(password),
        "is_approved": True,
        "role": "admin"
    }
    
    await db.users.insert_one(new_admin)
    print(f"Admin user {username} created successfully!")

if __name__ == "__main__":
    asyncio.run(create_admin())
