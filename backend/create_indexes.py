"""
Database Index Creation Script
Run this once to create indexes for optimal query performance
"""
import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from urllib.parse import quote_plus

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_USER = os.environ.get("MONGO_USER", "carboncredits")
MONGO_PASS_RAW = os.environ.get("MONGO_PASS", "Vihar2026")
MONGO_HOST = os.environ.get("MONGO_HOST", "clustercc.g83djvn.mongodb.net")
db_name = os.environ.get("DB_NAME", "ClusterCC")

MONGO_PASS = quote_plus(MONGO_PASS_RAW)

mongo_url = (
    f"mongodb+srv://{MONGO_USER}:{MONGO_PASS}@{MONGO_HOST}/{db_name}"
    f"?retryWrites=true&w=majority&authSource=admin&authMechanism=SCRAM-SHA-256"
)

# default_mongo_url = 'mongodb+srv://carboncredits:' + quote_plus('Vihar2026') + '@clustercc.g83djvn.mongodb.net/?appName=ClusterCC'
# mongo_url = os.environ.get('MONGO_URL', default_mongo_url)
# db_name = os.environ.get('DB_NAME', 'ClusterCC')

async def create_indexes():
    """Create database indexes for optimal query performance"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        print("Creating database indexes...")
        
        # Users collection indexes
        print("  - Creating users indexes...")
        await db.users.create_index("id", unique=True)
        await db.users.create_index("phone", unique=True)
        await db.users.create_index("role")
        await db.users.create_index([("name", "text"), ("phone", "text")])  # Text search
        await db.users.create_index("created_at")
        print("    ✓ Users indexes created")
        
        # Vihars collection indexes
        print("  - Creating vihars indexes...")
        await db.vihars.create_index("id", unique=True)
        await db.vihars.create_index("created_at")
        await db.vihars.create_index("vihar_date")
        await db.vihars.create_index("route_no")
        await db.vihars.create_index("created_by")
        await db.vihars.create_index([("created_at", -1)])  # For sorting
        print("    ✓ Vihars indexes created")
        
        # Participations collection indexes
        print("  - Creating participations indexes...")
        await db.participations.create_index("id", unique=True)
        await db.participations.create_index("vihar_id")
        await db.participations.create_index("user_id")
        await db.participations.create_index("status")
        await db.participations.create_index([("vihar_id", 1), ("user_id", 1)], unique=True)  # Compound unique
        await db.participations.create_index([("user_id", 1), ("status", 1)])  # For user queries
        await db.participations.create_index("created_at")
        print("    ✓ Participations indexes created")
        
        print("\n✅ All indexes created successfully!")
        print("\nIndex Summary:")
        print("  - Users: id, phone, role, text search, created_at")
        print("  - Vihars: id, created_at, vihar_date, route_no, created_by")
        print("  - Participations: id, vihar_id, user_id, status, compound indexes")
        
    except Exception as e:
        print(f"❌ Error creating indexes: {str(e)}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_indexes())

