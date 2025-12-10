import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'viharsevagroup')

print(f"Testing MongoDB connection...")
print(f"URL: {mongo_url}")
print(f"Database: {db_name}")
print("-" * 50)

async def test_connection():
    client = None
    try:
        client = AsyncIOMotorClient(mongo_url)
        # Test connection
        await client.admin.command('ping')
        print("✓ MongoDB connection successful!")
        
        # List databases
        db_list = await client.list_database_names()
        print(f"✓ Available databases: {db_list}")
        
        # Check if our database exists
        db = client[db_name]
        collections = await db.list_collection_names()
        print(f"✓ Database '{db_name}' exists")
        print(f"✓ Collections: {collections}")
        
        return True
    except Exception as e:
        print(f"✗ MongoDB connection failed: {e}")
        return False
    finally:
        if client:
            client.close()

if __name__ == "__main__":
    result = asyncio.run(test_connection())
    exit(0 if result else 1)



