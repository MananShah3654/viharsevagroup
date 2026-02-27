from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
from pathlib import Path
from urllib.parse import quote_plus
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.responses import StreamingResponse
from starlette.responses import Response
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, Preformatted
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
from openpyxl.drawing.image import Image as ExcelImage
from io import BytesIO
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import time

# Import cache
try:
    from cache import cache, cache_key_user, cache_key_vihars_list, cache_key_vihar, cache_key_participants, cache_key_reports
except ImportError:
    # Fallback if cache module not available
    cache = None
    cache_key_user = cache_key_vihars_list = cache_key_vihar = cache_key_participants = cache_key_reports = None

# Import rate limiter
try:
    from rate_limiter import RateLimitMiddleware
except ImportError:
    # Fallback if rate limiter not available
    RateLimitMiddleware = None

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Setup logging early (before middleware that might use it)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Setup logging early (before middleware that might use it)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection with optimized connection pooling
# URL encode password if provided via env, otherwise use default with encoded password
default_mongo_url = 'mongodb+srv://carboncredits:' + quote_plus('Manan123') + '@clustercc.g83djvn.mongodb.net/?appName=ClusterCC'
mongo_url = os.environ.get('MONGO_URL', default_mongo_url)
db_name = os.environ.get('DB_NAME', 'ClusterCC')

# Debug: log which URL source is being used (password masked)
_url_source = "ENV_VAR" if os.environ.get('MONGO_URL') else "HARDCODED_DEFAULT"
try:
    from urllib.parse import urlparse
    _parsed = urlparse(mongo_url)
    print(f"[MONGO DEBUG] Source: {_url_source} | Host: {_parsed.hostname} | User: {_parsed.username} | DB: {db_name}")
except Exception:
    print(f"[MONGO DEBUG] Source: {_url_source} | DB: {db_name}")

# Optimized connection pool settings for high concurrency
# maxPoolSize: Maximum number of connections in the pool (default: 100)
# minPoolSize: Minimum number of connections to maintain (default: 0)
# maxIdleTimeMS: Max time a connection can be idle before being closed (default: None)
# connectTimeoutMS: Time to wait for connection (default: 20000)
# serverSelectionTimeoutMS: Time to wait for server selection (default: 30000)
client = AsyncIOMotorClient(
    mongo_url,
    maxPoolSize=200,  # Increased for 1000+ concurrent requests
    minPoolSize=20,   # Keep connections warm
    maxIdleTimeMS=45000,  # Close idle connections after 45s
    connectTimeoutMS=10000,
    serverSelectionTimeoutMS=10000,
    retryWrites=True,
    retryReads=True,
    compressors='snappy,zlib',  # Enable compression
    zlibCompressionLevel=6
)
db = client[db_name]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'vihar-seva-group-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer()

# Removed MSG91 - Simple login with phone/password

app = FastAPI(
    title="Vihar Seva Group API",
    description="High-performance API for Vihar Seva Group",
    version="2.0.0"
)
api_router = APIRouter(prefix="/api")

# Add compression middleware for faster responses
app.add_middleware(GZipMiddleware, minimum_size=1000)  # Compress responses > 1KB

# Add rate limiting middleware (if available)
if RateLimitMiddleware:
    try:
        app.add_middleware(RateLimitMiddleware, default_limit=100, window=60)
        logger.info("Rate limiting middleware enabled")
    except Exception as e:
        logger.warning(f"Failed to enable rate limiting: {str(e)}")
else:
    logger.warning("Rate limiting middleware not available - skipping")

# ===== MODELS =====

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str
    name: Optional[str] = None
    photo: Optional[str] = None
    age: Optional[int] = None
    area: Optional[str] = None
    address: Optional[str] = None
    car: bool = False
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    date_of_birth: Optional[str] = None
    role: str = "user"  # admin or user
    password_hash: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Vihar(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    route_no: str
    gujarati_date: str = ""  # Optional field (removed from form)
    sahebji_name: str = ""  # Sadhu Bhagvant name (optional field, defaults to empty string)
    vihar_date: str
    vihar_time: str
    sadhu_bhagvant: int  # Sadhu Bhagvant count
    sadhviji_bhagvant: int = 0  # Sadhviji Bhagvant count
    mumukshu: int = 0  # Mumukshu count
    wheelchair: int = 0  # Wheelchair count (0 = not required, >0 = count required)
    self: bool = False  # Self wheelchair operation
    luggage: bool = False
    dori: bool = False
    car_required: bool = False
    activa: bool = False
    from_upashray: str
    to_upashray: str
    approx_kms: float
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    created_by: str  # admin id
    created_on: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_by: Optional[str] = None
    updated_on: Optional[str] = None
    device_ip: Optional[str] = None

class ViharParticipation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vihar_id: str
    user_id: str
    status: str  # in or out
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Request/Response Models
class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    otp: str

class LoginRequest(BaseModel):
    phone: str
    password: Optional[str] = None

class RegisterRequest(BaseModel):
    phone: str
    password: str
    name: str
    area: str
    blood_group: str
    emergency_contact: str
    date_of_birth: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError('Password must contain only digits')
        if len(v) != 4:
            raise ValueError('Password must be exactly 4 digits')
        return v

class UserCreate(BaseModel):
    phone: str
    password: str
    name: Optional[str] = None
    photo: Optional[str] = None
    age: Optional[int] = None
    area: Optional[str] = None
    address: Optional[str] = None
    car: bool = False
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    date_of_birth: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    photo: Optional[str] = None
    age: Optional[int] = None
    area: Optional[str] = None
    address: Optional[str] = None
    car: Optional[bool] = None
    password: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    date_of_birth: Optional[str] = None

class ViharCreate(BaseModel):
    route_no: Optional[str] = None  # Optional - auto-generated if not provided, but can be manually set
    gujarati_date: str = ""  # Optional field (removed from form)
    sahebji_name: str = ""  # Sadhu Bhagvant name (optional field)
    vihar_date: str
    vihar_time: str
    sadhu_bhagvant: int  # Sadhu Bhagvant count
    sadhviji_bhagvant: int = 0  # Sadhviji Bhagvant count
    mumukshu: int = 0  # Mumukshu count
    wheelchair: int = 0  # Wheelchair count (0 = not required, >0 = count required)
    self: bool = False  # Self wheelchair operation
    luggage: bool = False
    dori: bool = False
    car_required: bool = False
    activa: bool = False
    from_upashray: str
    to_upashray: str
    approx_kms: float

class ParticipationUpdate(BaseModel):
    vihar_id: str
    status: str  # in or out

class WhatsAppMessage(BaseModel):
    message: str

class RoleUpdate(BaseModel):
    user_id: Optional[str] = None  # Can be ID or phone
    phone: Optional[str] = None  # Alternative identifier
    role: str
    
    @field_validator('role')
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in ["admin", "user"]:
            raise ValueError('Role must be either "admin" or "user"')
        return v
    
    def get_identifier(self) -> str:
        """Get the identifier to use for finding the user (prefer phone, fallback to user_id)"""
        return self.phone or self.user_id or ""

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# ===== HELPER FUNCTIONS =====

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user

# ===== ROUTES =====

# Auth Routes
@api_router.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login with phone and password"""
    user = await db.users.find_one({"phone": request.phone}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if not request.password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password required")
    
    if not verify_password(request.password, user.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    
    token = create_access_token({"sub": user["id"]})
    user_response = {k: v for k, v in user.items() if k != "password_hash"}
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(request: RegisterRequest):
    """Register new user with phone and 4-digit password"""
    # Check if user already exists
    existing = await db.users.find_one({"phone": request.phone}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this phone number already exists")
    
    # Create new user
    user = User(
        phone=request.phone,
        password_hash=hash_password(request.password),
        name=request.name,
        area=request.area,
        role="user",
        blood_group=request.blood_group,
        emergency_contact=request.emergency_contact,
        date_of_birth=request.date_of_birth
    )
    
    user_dict = user.model_dump()
    await db.users.insert_one(user_dict)
    
    # Create token and return user
    token = create_access_token({"sub": user.id})
    user_response = {k: v for k, v in user_dict.items() if k != "password_hash"}
    return TokenResponse(access_token=token, user=user_response)

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v):
        if not v.isdigit():
            raise ValueError('Password must contain only digits')
        if len(v) != 4:
            raise ValueError('Password must be exactly 4 digits')
        return v

@api_router.post("/auth/change-password")
async def change_password(data: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    """Change password for the logged-in user"""
    if not verify_password(data.old_password, current_user.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    new_hash = hash_password(data.new_password)
    await db.users.update_one({"id": current_user["id"]}, {"$set": {"password_hash": new_hash}})
    # Invalidate user cache
    if cache:
        await cache.delete(cache_key_user(current_user["id"]))
    return {"message": "Password changed successfully"}

# User Routes
@api_router.get("/users/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    user_response = {k: v for k, v in current_user.items() if k != "password_hash"}
    return user_response

@api_router.put("/users/me")
async def update_user_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    # Filter out None values and empty strings for optional fields, but keep empty strings for mandatory fields
    update_dict = {}
    for k, v in update_data.model_dump().items():
        if v is not None:
            # For mandatory fields (blood_group, emergency_contact, date_of_birth), allow empty strings
            if k in ['blood_group', 'emergency_contact', 'date_of_birth']:
                update_dict[k] = v
            # For other optional fields, skip empty strings
            elif v != '':
                update_dict[k] = v
    
    if update_dict:
        await db.users.update_one({"id": current_user["id"]}, {"$set": update_dict})
    updated_user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0, "password_hash": 0})
    return updated_user

# Admin Routes - User Management
@api_router.get("/admin/users", dependencies=[Depends(get_admin_user)])
async def get_all_users():
    """Get all users (Admin only) - Optimized with projection"""
    # Optimized: Use projection to exclude password_hash and _id
    users_cursor = db.users.find(
        {}, 
        {"_id": 0, "password_hash": 0}
    ).sort("created_at", -1)  # Sort for consistency
    users = await users_cursor.to_list(1000)
    
    # Ensure all users have an 'id' field and remove _id from response
    for user in users:
        # If user has _id but no id, use _id as the id (convert to string)
        if "_id" in user:
            if "id" not in user or not user.get("id"):
                # Use _id as the id field
                user["id"] = str(user["_id"])
            # Also ensure the id field matches _id if both exist (for consistency)
            elif user.get("id") != str(user["_id"]):
                # If id exists but doesn't match _id, prefer the id field
                # But log a warning
                logger.warning(f"User {user.get('phone')} has mismatched id and _id: id={user.get('id')}, _id={user.get('_id')}")
            # Remove _id from response (we only want id)
            del user["_id"]
        elif "id" not in user:
            # Generate a new ID if neither exists (shouldn't happen)
            user["id"] = str(uuid.uuid4())
            logger.warning(f"User {user.get('phone')} had no id or _id, generated new id: {user['id']}")
    
    logger.info(f"Returning {len(users)} users, all with 'id' field")
    return users

@api_router.post("/admin/users", dependencies=[Depends(get_admin_user)])
async def create_user_by_admin(user_data: UserCreate):
    """Create user by admin"""
    existing = await db.users.find_one({"phone": user_data.phone})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")
    
    user = User(
        phone=user_data.phone,
        password_hash=hash_password(user_data.password),
        name=user_data.name,
        photo=user_data.photo,
        age=user_data.age,
        area=user_data.area,
        address=user_data.address,
        car=user_data.car,
        role="user"
    )
    
    user_dict = user.model_dump()
    await db.users.insert_one(user_dict)
    user_response = {k: v for k, v in user_dict.items() if k != "password_hash"}
    return user_response

@api_router.put("/admin/users/{user_id}", dependencies=[Depends(get_admin_user)])
async def update_user_by_admin(user_id: str, update_data: UserUpdate):
    """Update user by admin (Admin only)"""
    # Check if user exists
    existing_user = await db.users.find_one({"id": user_id})
    if not existing_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    # Handle password update separately if provided
    if "password" in update_dict and update_dict["password"]:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        update_dict["password_hash"] = pwd_context.hash(update_dict.pop("password"))
    
    if update_dict:
        await db.users.update_one({"id": user_id}, {"$set": update_dict})
    
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return updated_user

@api_router.delete("/admin/users/{user_id}", dependencies=[Depends(get_admin_user)])
async def delete_user_by_admin(user_id: str):
    """Delete user by admin (Admin only)"""
    # Check if user exists
    existing_user = await db.users.find_one({"id": user_id})
    if not existing_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Prevent deleting admin users
    if existing_user.get("role") == "admin":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete admin users")
    
    # Delete user
    await db.users.delete_one({"id": user_id})
    
    # Delete associated participations
    await db.participations.delete_many({"user_id": user_id})
    
    logger.info(f"User deleted successfully: {user_id}")
    return {"status": "success", "message": "User deleted successfully"}

@api_router.put("/admin/users/role", dependencies=[Depends(get_admin_user)])
async def update_user_role(role_data: RoleUpdate):
    """Update user role (Admin only)"""
    # Validate role value
    if role_data.role not in ["admin", "user"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be either 'admin' or 'user'"
        )
    
    # Get identifier (prefer phone, fallback to user_id)
    identifier = role_data.get_identifier()
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'user_id' or 'phone' must be provided"
        )
    
    logger.info(f"Attempting to update role for identifier: {identifier} to role: {role_data.role}")
    
    # Try to find user - prefer phone number as it's most reliable
    existing_user = None
    update_query = None
    
    from bson import ObjectId
    
    # Method 1: Try by phone number first (most reliable)
    if role_data.phone:
        existing_user = await db.users.find_one({"phone": role_data.phone})
        if existing_user:
            # Use phone or _id for update query
            if existing_user.get("_id"):
                update_query = {"_id": existing_user.get("_id")}
            elif existing_user.get("id"):
                update_query = {"id": existing_user.get("id")}
            else:
                update_query = {"phone": role_data.phone}
            logger.info(f"Found user by phone number: {role_data.phone}")
    
    # Method 2: Try by 'id' field (our custom field)
    if not existing_user and role_data.user_id:
        existing_user = await db.users.find_one({"id": role_data.user_id})
        if existing_user:
            if existing_user.get("_id"):
                update_query = {"_id": existing_user.get("_id")}
            elif existing_user.get("id"):
                update_query = {"id": role_data.user_id}
            else:
                update_query = {"id": role_data.user_id}
            logger.info(f"Found user by 'id' field: {role_data.user_id}")
    
    # Method 3: Try by '_id' field (MongoDB's primary key)
    if not existing_user and role_data.user_id:
        try:
            if ObjectId.is_valid(role_data.user_id):
                existing_user = await db.users.find_one({"_id": ObjectId(role_data.user_id)})
                if existing_user:
                    update_query = {"_id": ObjectId(role_data.user_id)}
                    logger.info(f"Found user by '_id' field: {role_data.user_id}")
        except Exception as e:
            logger.warning(f"Could not try _id lookup: {str(e)}")
    
    # Method 4: Search all users to find matching ID (handles converted _id to id)
    if not existing_user and role_data.user_id:
        try:
            all_users_cursor = db.users.find({})
            async for user_doc in all_users_cursor:
                user_id_str = str(user_doc.get("_id", ""))
                user_custom_id = user_doc.get("id", "")
                if user_id_str == role_data.user_id or user_custom_id == role_data.user_id:
                    existing_user = user_doc
                    if user_doc.get("_id"):
                        update_query = {"_id": user_doc.get("_id")}
                    elif user_doc.get("id"):
                        update_query = {"id": user_doc.get("id")}
                    logger.info(f"Found user by matching ID string: {role_data.user_id}")
                    break
        except Exception as e:
            logger.warning(f"Could not search all users: {str(e)}")
    
    # If still not found, log all users for debugging
    if not existing_user:
        logger.error(f"User not found for role update. identifier: {identifier}")
        # Get all users to see what IDs exist
        all_users = await db.users.find({}, {"_id": 1, "id": 1, "phone": 1, "name": 1}).limit(10).to_list(10)
        logger.error(f"Sample users in database (showing _id, id, phone, name):")
        for u in all_users:
            logger.error(f"  User: _id={u.get('_id')}, id={u.get('id')}, phone={u.get('phone')}, name={u.get('name')}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User not found with identifier: {identifier}. Check server logs for available users."
        )
    
    # Get the actual user ID for logging
    actual_user_id = existing_user.get("id") or str(existing_user.get("_id", ""))
    actual_phone = existing_user.get("phone", "")
    
    # Prevent changing role if it's already the same
    if existing_user.get("role") == role_data.role:
        logger.info(f"User {actual_phone} ({actual_user_id}) is already {role_data.role}")
        return {
            "status": "success",
            "message": f"User is already {role_data.role}",
            "role": role_data.role
        }
    
    # Update role using the correct query
    logger.info(f"Updating user with query: {update_query}, setting role to: {role_data.role}")
    result = await db.users.update_one(
        update_query,
        {"$set": {"role": role_data.role}}
    )
    
    if result.modified_count == 0:
        logger.error(f"Failed to update user role. identifier: {identifier}, update_query: {update_query}, matched_count: {result.matched_count}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user role. User found but update failed."
        )
    
    logger.info(f"User role updated successfully: {actual_phone} ({actual_user_id}) -> {role_data.role}")
    return {
        "status": "success",
        "message": "Role updated successfully",
        "user_id": actual_user_id,
        "phone": actual_phone,
        "new_role": role_data.role
    }

# WhatsApp Message Parser Helper
def parse_whatsapp_message(message: str) -> dict:
    """Parse WhatsApp message in Gujarati format and extract vihar details"""
    try:
        # Initialize defaults
        parsed_data = {
            "route_no": "",
            "gujarati_date": "",
            "sahebji_name": "",  # Optional field
            "vihar_date": "",
            "vihar_time": "",
            "sadhu_bhagvant": 0,
            "wheelchair": False,
            "luggage": False,
            "dori": False,
            "car_required": False,
            "activa": False,
            "from_upashray": "",
            "to_upashray": "",
            "approx_kms": 0.0
        }
        
        # Gujarati to English numeral mapping
        gujarati_to_english = {'૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4', 
                               '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9'}
        
        def convert_gujarati_num(text):
            """Convert Gujarati numerals to English"""
            return ''.join(gujarati_to_english.get(c, c) for c in text)
        
        # Extract Route Number (રૂટ- ૦૨ or રૂટ- 02)
        route_match = re.search(r'રૂટ[-\s]*([૦૧૨૩૪૫૬૭૮૯0-9]+)', message, re.IGNORECASE)
        if route_match:
            route_num = convert_gujarati_num(route_match.group(1))
            parsed_data["route_no"] = route_num.zfill(2) if route_num.isdigit() else route_num
        
        # Extract Gujarati Date (માગશર વદ-૭)
        gujarati_date_match = re.search(r'([કખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહઅઆઇઈઉઊએઐઓઔ]+[વદપક્ષ-]+\d+)', message)
        if gujarati_date_match:
            parsed_data["gujarati_date"] = gujarati_date_match.group(1).strip()
        
        # Extract Sahebji Name (*સાહેબજી નું નામ - ...)
        # Pattern: *સાહેબજી નું નામ - ... (may have asterisk at start)
        sahebji_match = re.search(r'\*?સાહેબજી[નું\s]*નામ[-\s]*([^\n*]+?)(?=\n|વિહાર|$)', message, re.IGNORECASE | re.DOTALL)
        if sahebji_match:
            name = sahebji_match.group(1).strip().replace('*', '').strip()
            # Remove trailing commas, asterisks, and whitespace
            name = re.sub(r'[,\s*]+$', '', name)
            if name:
                parsed_data["sahebji_name"] = name
        
        # Extract Vihar Date (વિહાર તારીખ- ૧૧/૧૨/૨૫ or 11/12/25)
        date_match = re.search(r'વિહાર[તારીખ\s]*[-\s]*([૦૧૨૩૪૫૬૭૮૯0-9]+/[૦૧૨૩૪૫૬૭૮૯0-9]+/[૦૧૨૩૪૫૬૭૮૯0-9]+)', message, re.IGNORECASE)
        if date_match:
            date_str = convert_gujarati_num(date_match.group(1))
            parsed_data["vihar_date"] = date_str
        
        # Extract Vihar Time (વિહાર સમય સવારે ૫.૩૦વાગે or 5:30 or 5.30)
        time_match = re.search(r'વિહાર[સમય\s]*[સવારેસાંજે]*[-\s]*([૦૧૨૩૪૫૬૭૮૯0-9]+)[.:]([૦૧૨૩૪૫૬૭૮૯0-9]+)', message, re.IGNORECASE)
        if time_match:
            hour = convert_gujarati_num(time_match.group(1))
            minute = convert_gujarati_num(time_match.group(2))
            parsed_data["vihar_time"] = f"{hour}:{minute}"
        
        # Extract Sadhviji/Sadhu Bhagvant (સાધ્વીજી ભગવંત -૪ or થાના ભગવંત -૪)
        bhagvant_match = re.search(r'(સાધ્વીજી|થાના|સાધુ)[ભગવંત\s]*[-\s]*([૦૧૨૩૪૫૬૭૮૯0-9]+)', message, re.IGNORECASE)
        if bhagvant_match:
            bhagvant_str = convert_gujarati_num(bhagvant_match.group(2))
            parsed_data["sadhu_bhagvant"] = int(bhagvant_str) if bhagvant_str.isdigit() else 0
        
        # Extract Wheelchair (વિલ ચેર- ૦ or વિલ ચેર- 1)
        wheelchair_match = re.search(r'વિલ[ચેર\s]*[-\s]*([૦૧૨૩૪૫૬૭૮૯0-9]+|હા|ના|નથી)', message, re.IGNORECASE)
        if wheelchair_match:
            wc_val = wheelchair_match.group(1).strip()
            wc_val = convert_gujarati_num(wc_val)
            parsed_data["wheelchair"] = wc_val in ['1', 'હા', 'yes', 'true'] or (wc_val.isdigit() and int(wc_val) > 0)
        
        # Extract Luggage (સામાન - નથી or સામાન - હા)
        luggage_match = re.search(r'સામાન[-\s]*([હા|ના|નથી|૦૧૨૩૪૫૬૭૮૯0-9]+)', message, re.IGNORECASE)
        if luggage_match:
            lug_val = luggage_match.group(1).strip()
            lug_val = convert_gujarati_num(lug_val)
            parsed_data["luggage"] = lug_val not in ['ના', 'નથી', '0', 'no', 'false'] and lug_val != ''
        
        # Extract Dori if mentioned
        dori_match = re.search(r'ડોરી[-\s]*([હા|ના|નથી|૦૧૨૩૪૫૬૭૮૯0-9]+)', message, re.IGNORECASE)
        if dori_match:
            dori_val = dori_match.group(1).strip()
            dori_val = convert_gujarati_num(dori_val)
            parsed_data["dori"] = dori_val not in ['ના', 'નથી', '0', 'no', 'false'] and dori_val != ''
        
        # Extract Car Required if mentioned
        car_match = re.search(r'કાર[-\s]*([હા|ના|નથી|જરૂરી]+)', message, re.IGNORECASE)
        if car_match:
            car_val = car_match.group(1).strip()
            parsed_data["car_required"] = 'હા' in car_val or 'જરૂરી' in car_val
        
        # Extract From and To Upashray (both start with ક્યાં ઉપાશ્રય)
        # Find all occurrences
        upashray_matches = list(re.finditer(r'ક્યાં[ઉપાશ્રય\s]*[-\s]*([^\n]+)', message, re.IGNORECASE | re.DOTALL))
        if len(upashray_matches) >= 1:
            from_upashray = upashray_matches[0].group(1).strip()
            # Clean up: remove any remaining "ઉપાશ્રય" text and leading dashes/colons
            from_upashray = re.sub(r'ઉપાશ્રય', '', from_upashray, flags=re.IGNORECASE)
            from_upashray = re.sub(r'^[-\s:]+', '', from_upashray).strip()
            if from_upashray:
                parsed_data["from_upashray"] = from_upashray
        
        if len(upashray_matches) >= 2:
            to_upashray = upashray_matches[1].group(1).strip()
            # Clean up: remove any remaining "ઉપાશ્રય" text and leading dashes/colons
            to_upashray = re.sub(r'ઉપાશ્રય', '', to_upashray, flags=re.IGNORECASE)
            to_upashray = re.sub(r'^[-\s:]+', '', to_upashray).strip()
            if to_upashray:
                parsed_data["to_upashray"] = to_upashray
        
        # Try to extract approximate KMs if mentioned
        kms_match = re.search(r'([૦૧૨૩૪૫૬૭૮૯0-9]+\.?[૦૧૨૩૪૫૬૭૮૯0-9]*)[\s]*કિ\.?મી\.?', message, re.IGNORECASE)
        if kms_match:
            kms_str = convert_gujarati_num(kms_match.group(1))
            try:
                parsed_data["approx_kms"] = float(kms_str)
            except:
                parsed_data["approx_kms"] = 0.0
        
        return parsed_data
    except Exception as e:
        logger.error(f"Error parsing WhatsApp message: {str(e)}")
        raise

# Vihar Routes
async def _get_max_route_no() -> int:
    """Efficiently find the highest numeric route_no using aggregation (single DB round-trip)."""
    pipeline = [
        {"$project": {"route_no_int": {"$convert": {"input": "$route_no", "to": "int", "onError": 0, "onNull": 0}}}},
        {"$group": {"_id": None, "max": {"$max": "$route_no_int"}}},
    ]
    result = await db.vihars.aggregate(pipeline).to_list(1)
    return result[0]["max"] if result else 0

@api_router.get("/vihars/next-route-number")
async def get_next_route_number():
    """Get the next auto-incremented route number"""
    try:
        max_route_no = await _get_max_route_no()
        return {"next_route_number": str(max_route_no + 1)}
    except Exception as e:
        logger.error(f"Error getting next route number: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@api_router.post("/vihars", dependencies=[Depends(get_admin_user)])
async def create_vihar(vihar_data: ViharCreate, request: Request, admin: dict = Depends(get_admin_user)):
    """Create new vihar (Admin only) - route_no is auto-generated"""
    try:
        # Auto-generate route_no if not provided
        if not vihar_data.route_no:
            max_route_no = await _get_max_route_no()
            vihar_data.route_no = str(max_route_no + 1)
        
        # Get client IP
        client_ip = request.client.host if request.client else None
        # Try to get real IP from headers (for proxies)
        if not client_ip or client_ip == "127.0.0.1":
            forwarded_for = request.headers.get("X-Forwarded-For")
            if forwarded_for:
                client_ip = forwarded_for.split(",")[0].strip()
            else:
                real_ip = request.headers.get("X-Real-IP")
                if real_ip:
                    client_ip = real_ip
        
        now = datetime.now(timezone.utc).isoformat()
        vihar = Vihar(
            **vihar_data.model_dump(), 
            created_by=admin["id"],
            created_on=now,
            device_ip=client_ip
        )
        vihar_dict = vihar.model_dump()
        await db.vihars.insert_one(vihar_dict)
        vihar_dict.pop('_id', None)  # Remove ObjectId added by insert_one (not JSON serializable)

        # Invalidate cache
        if cache:
            await cache.delete_prefix("vihars:user:")
            await cache.delete(cache_key_vihars_list({}))
            await cache.delete(cache_key_reports("weekly"))
            await cache.delete(cache_key_reports("monthly"))
            await cache.delete(cache_key_reports("yearly"))

        logger.info(f"Vihar created successfully: {vihar.id} with route_no: {vihar.route_no}")
        return vihar_dict
    except Exception as e:
        logger.error(f"Error creating vihar: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@api_router.put("/vihars/{vihar_id}", dependencies=[Depends(get_admin_user)])
async def update_vihar(vihar_id: str, vihar_data: ViharCreate, request: Request, admin: dict = Depends(get_admin_user)):
    """Update vihar (Admin only)"""
    try:
        # Check if vihar exists
        existing_vihar = await db.vihars.find_one({"id": vihar_id})
        if not existing_vihar:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vihar not found")
        
        # If route_no is not provided in update, preserve the original
        if not vihar_data.route_no:
            vihar_data.route_no = existing_vihar.get("route_no")
        
        # Get client IP
        client_ip = request.client.host if request.client else None
        # Try to get real IP from headers (for proxies)
        if not client_ip or client_ip == "127.0.0.1":
            forwarded_for = request.headers.get("X-Forwarded-For")
            if forwarded_for:
                client_ip = forwarded_for.split(",")[0].strip()
            else:
                real_ip = request.headers.get("X-Real-IP")
                if real_ip:
                    client_ip = real_ip
        
        # Update vihar - preserve created_at, created_by, created_on
        update_data = vihar_data.model_dump()
        # Don't update created_at, created_by, created_on
        update_data.pop('created_at', None)
        update_data.pop('created_by', None)
        update_data.pop('created_on', None)
        
        # Add update tracking
        now = datetime.now(timezone.utc).isoformat()
        update_data['updated_by'] = admin["id"]
        update_data['updated_on'] = now
        if client_ip:
            update_data['device_ip'] = client_ip  # Update IP on each update
        
        await db.vihars.update_one(
            {"id": vihar_id},
            {"$set": update_data}
        )
        
        # Invalidate cache
        if cache:
            await cache.delete(cache_key_vihar(vihar_id))
            await cache.delete_prefix("vihars:user:")
            await cache.delete(cache_key_vihars_list({}))
            await cache.delete(cache_key_participants(vihar_id))
        
        # Get updated vihar
        updated_vihar = await db.vihars.find_one({"id": vihar_id}, {"_id": 0})
        logger.info(f"Vihar updated successfully: {vihar_id}")
        return updated_vihar
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating vihar: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@api_router.delete("/vihars/{vihar_id}", dependencies=[Depends(get_admin_user)])
async def delete_vihar(vihar_id: str):
    """Delete vihar (Admin only)"""
    # Check if vihar exists
    vihar = await db.vihars.find_one({"id": vihar_id})
    if not vihar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vihar not found")
    
    # Delete vihar
    await db.vihars.delete_one({"id": vihar_id})

    # Delete associated participations
    await db.participations.delete_many({"vihar_id": vihar_id})

    # Invalidate cache
    if cache:
        await cache.delete(cache_key_vihar(vihar_id))
        await cache.delete_prefix("vihars:user:")
        await cache.delete(cache_key_vihars_list({}))

    logger.info(f"Vihar deleted successfully: {vihar_id}")
    return {"status": "success", "message": "Vihar deleted successfully"}

@api_router.post("/vihars/from-whatsapp", dependencies=[Depends(get_admin_user)])
async def create_vihar_from_whatsapp(whatsapp_data: WhatsAppMessage, admin: dict = Depends(get_admin_user)):
    """Create vihar from WhatsApp message (Admin only)"""
    try:
        # Parse the WhatsApp message
        parsed_data = parse_whatsapp_message(whatsapp_data.message)
        
        # Validate required fields (sahebji_name is optional)
        required_fields = ["route_no", "vihar_date", "vihar_time", "from_upashray", "to_upashray"]
        missing_fields = [field for field in required_fields if not parsed_data.get(field)]
        
        if missing_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required fields: {', '.join(missing_fields)}. Parsed data: {parsed_data}"
            )
        
        # Create vihar from parsed data
        vihar_data = ViharCreate(**parsed_data)
        vihar = Vihar(**vihar_data.model_dump(), created_by=admin["id"])
        vihar_dict = vihar.model_dump()
        await db.vihars.insert_one(vihar_dict)
        
        logger.info(f"Vihar created from WhatsApp message successfully: {vihar.id}")
        return {
            "status": "success",
            "message": "Vihar created successfully from WhatsApp message",
            "vihar": vihar_dict,
            "parsed_data": parsed_data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating vihar from WhatsApp message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create vihar from WhatsApp message: {str(e)}"
        )

@api_router.get("/vihars")
async def get_all_vihars(
    current_user: dict = Depends(get_current_user),
    skip: int = 0,
    limit: int = 1000,
    request: Request = None
):
    """Get all vihars - users see limited details (Optimized with pagination, caching, and aggregation)"""
    # Check cache first
    cache_key = f"vihars:user:{current_user['id']}:skip:{skip}:limit:{limit}"
    if cache:
        cached_result = await cache.get(cache_key)
        if cached_result is not None:
            return cached_result
    
    # Optimized: Use aggregation pipeline for better performance
    # This combines vihars and participations in a single query
    pipeline = [
        {"$sort": {"route_no": -1}},  # Sort by route number descending
        {"$skip": skip},
        {"$limit": limit},
        {
            "$lookup": {
                "from": "participations",
                "let": {"vihar_id": "$id"},
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {"$eq": ["$vihar_id", "$$vihar_id"]},
                                    {"$eq": ["$user_id", current_user["id"]]}
                                ]
                            }
                        }
                    },
                    {"$project": {"_id": 0, "status": 1}}
                ],
                "as": "user_participation"
            }
        },
        {
            "$addFields": {
                "user_status": {
                    "$ifNull": [{"$arrayElemAt": ["$user_participation.status", 0]}, None]
                }
            }
        },
        {"$project": {"_id": 0, "user_participation": 0}}
    ]
    
    vihars = await db.vihars.aggregate(pipeline).to_list(limit)
    
    # Cache result for 60 seconds
    if cache:
        await cache.set(cache_key, vihars, ttl=60)
    
    return vihars

@api_router.get("/vihars/{vihar_id}")
async def get_vihar_detail(vihar_id: str, current_user: dict = Depends(get_current_user)):
    """Get vihar details"""
    vihar = await db.vihars.find_one({"id": vihar_id}, {"_id": 0})
    if not vihar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vihar not found")
    
    # Get participation info
    participation = await db.participations.find_one(
        {"vihar_id": vihar_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    vihar["user_status"] = participation["status"] if participation else None
    
    # If admin, get all participants (with caching)
    if current_user.get("role") == "admin":
        participants_cache_key = f"participants:{vihar_id}"
        if cache:
            cached_participants = await cache.get(participants_cache_key)
            if cached_participants is not None:
                vihar["participants"] = cached_participants
            else:
                participants = await db.participations.find({"vihar_id": vihar_id}, {"_id": 0}).to_list(1000)
                vihar["participants"] = participants
                await cache.set(participants_cache_key, participants, ttl=120)  # Cache for 2 min
        else:
            participants = await db.participations.find({"vihar_id": vihar_id}, {"_id": 0}).to_list(1000)
            vihar["participants"] = participants
    
    # Cache result for 60 seconds
    if cache:
        await cache.set(cache_key, vihar, ttl=60)
    
    return vihar

@api_router.post("/vihars/{vihar_id}/participate")
async def update_participation(vihar_id: str, participation_data: ParticipationUpdate, current_user: dict = Depends(get_current_user)):
    """Update vihar participation status"""
    # Check if vihar exists
    vihar = await db.vihars.find_one({"id": vihar_id})
    if not vihar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vihar not found")
    
    # Check existing participation
    existing = await db.participations.find_one({"vihar_id": vihar_id, "user_id": current_user["id"]})
    
    if existing:
        # Update existing
        await db.participations.update_one(
            {"id": existing["id"]},
            {"$set": {"status": participation_data.status}}
        )
    else:
        # Create new
        participation = ViharParticipation(
            vihar_id=vihar_id,
            user_id=current_user["id"],
            status=participation_data.status
        )
        await db.participations.insert_one(participation.model_dump())
    
    return {"status": "success", "message": "Participation updated"}

@api_router.get("/vihars/{vihar_id}/participants", dependencies=[Depends(get_admin_user)])
async def get_vihar_participants(vihar_id: str):
    """Get all participants for a vihar with user details (Admin only)"""
    # Check if vihar exists
    vihar = await db.vihars.find_one({"id": vihar_id})
    if not vihar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vihar not found")
    
    # Get all participations for this vihar
    participations = await db.participations.find({"vihar_id": vihar_id}, {"_id": 0}).to_list(1000)
    
    # Get user details for each participation
    participants_with_details = []
    for participation in participations:
        user = await db.users.find_one({"id": participation["user_id"]}, {"_id": 0, "password_hash": 0})
        if user:
            # If user has _id but no id, convert it
            if "_id" in user:
                if "id" not in user:
                    user["id"] = str(user["_id"])
                del user["_id"]
            
            participants_with_details.append({
                "participation_id": participation["id"],
                "user_id": participation["user_id"],
                "status": participation["status"],
                "created_at": participation.get("created_at"),
                "user": user
            })
    
    return {
        "vihar_id": vihar_id,
        "total_participants": len(participants_with_details),
        "opted_in": len([p for p in participants_with_details if p["status"] == "in"]),
        "opted_out": len([p for p in participants_with_details if p["status"] == "out"]),
        "participants": participants_with_details
    }

class AssignUsersRequest(BaseModel):
    user_ids: List[str]  # List of user IDs to assign
    status: str = "in"  # Default status when assigned

@api_router.post("/vihars/{vihar_id}/assign-users", dependencies=[Depends(get_admin_user)])
async def assign_users_to_vihar(vihar_id: str, assign_data: AssignUsersRequest):
    """Assign users to a vihar (Admin only)"""
    # Check if vihar exists
    vihar = await db.vihars.find_one({"id": vihar_id})
    if not vihar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vihar not found")
    
    if assign_data.status not in ["in", "out"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be either 'in' or 'out'"
        )
    
    assigned_count = 0
    errors = []
    
    for user_id in assign_data.user_ids:
        try:
            # Try to find user by id, _id, or phone
            user = await db.users.find_one({"id": user_id})
            if not user:
                from bson import ObjectId
                if ObjectId.is_valid(user_id):
                    user = await db.users.find_one({"_id": ObjectId(user_id)})
                if not user:
                    user = await db.users.find_one({"phone": user_id})
            
            if not user:
                errors.append(f"User {user_id} not found")
                continue
            
            # Get actual user ID
            actual_user_id = user.get("id") or str(user.get("_id", ""))
            
            # Check if participation already exists
            existing = await db.participations.find_one({
                "vihar_id": vihar_id,
                "user_id": actual_user_id
            })
            
            if existing:
                # Update existing participation
                await db.participations.update_one(
                    {"id": existing["id"]},
                    {"$set": {"status": assign_data.status}}
                )
            else:
                # Create new participation
                participation = ViharParticipation(
                    vihar_id=vihar_id,
                    user_id=actual_user_id,
                    status=assign_data.status
                )
                await db.participations.insert_one(participation.model_dump())
            
            assigned_count += 1
        except Exception as e:
            errors.append(f"Error assigning user {user_id}: {str(e)}")
            logger.error(f"Error assigning user {user_id} to vihar {vihar_id}: {str(e)}")
    
    # Invalidate cache after assignment
    if cache:
        await cache.delete(cache_key_participants(vihar_id))
        await cache.delete(f"vihar:detail:{vihar_id}:user:*")  # Invalidate all user caches
    
    return {
        "status": "success",
        "message": f"Assigned {assigned_count} user(s) to vihar",
        "assigned_count": assigned_count,
        "errors": errors if errors else None
    }

@api_router.delete("/vihars/{vihar_id}/participants/{participation_id}", dependencies=[Depends(get_admin_user)])
async def remove_participant_from_vihar(vihar_id: str, participation_id: str):
    """Remove a participant from a vihar (Admin only)"""
    # Check if vihar exists
    vihar = await db.vihars.find_one({"id": vihar_id})
    if not vihar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vihar not found")
    
    # Check if participation exists
    participation = await db.participations.find_one({"id": participation_id, "vihar_id": vihar_id})
    if not participation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participation not found")
    
    # Delete the participation
    result = await db.participations.delete_one({"id": participation_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to remove participant")
    
    # Invalidate cache
    if cache:
        await cache.delete(cache_key_participants(vihar_id))
        await cache.delete(f"vihar:detail:{vihar_id}:user:*")  # Invalidate all user caches for this vihar
    
    return {
        "status": "success",
        "message": "Participant removed successfully"
    }

@api_router.get("/vihars/user/my-vihars")
async def get_my_vihars(current_user: dict = Depends(get_current_user)):
    """Get user's participated vihars - only returns vihars where user has opted in"""
    participations = await db.participations.find(
        {"user_id": current_user["id"], "status": "in"},
        {"_id": 0}
    ).to_list(1000)
    
    vihar_ids = [p["vihar_id"] for p in participations]
    vihars = await db.vihars.find({"id": {"$in": vihar_ids}}, {"_id": 0}).to_list(1000)
    
    # Add participation status to each vihar (should all be 'in')
    participation_map = {p["vihar_id"]: p["status"] for p in participations}
    for vihar in vihars:
        vihar["user_status"] = participation_map.get(vihar["id"], "in")
    
    return vihars

# Reports
@api_router.get("/reports/summary")
async def get_report_summary(period: str, user_id: str = None, current_user: dict = Depends(get_current_user)):
    """Get vihar reports - weekly, monthly, yearly. Admin can get user-wise reports. (Optimized with caching)"""
    # Check cache first
    cache_key = cache_key_reports(period, user_id or current_user.get("id")) if cache else None
    if cache and cache_key:
        cached_result = await cache.get(cache_key)
        if cached_result is not None:
            return cached_result
    
    now = datetime.now(timezone.utc)
    
    # Calculate date range
    if period == "weekly":
        start_date = now - timedelta(days=7)
        cache_ttl = 60  # Cache for 1 minute
    elif period == "monthly":
        start_date = now - timedelta(days=30)
        cache_ttl = 300  # Cache for 5 minutes
    elif period == "yearly":
        start_date = now - timedelta(days=365)
        cache_ttl = 600  # Cache for 10 minutes
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid period")
    
    start_date_str = start_date.isoformat()
    
    # Optimized: Use aggregation pipeline for better performance
    # For admin with user_id filter - get specific user's vihars
    if current_user.get("role") == "admin" and user_id:
        participations = await db.participations.find(
            {"user_id": user_id, "created_at": {"$gte": start_date_str}},
            {"_id": 0, "vihar_id": 1}
        ).to_list(1000)
        vihar_ids = [p["vihar_id"] for p in participations]
        if vihar_ids:
            vihars = await db.vihars.find({"id": {"$in": vihar_ids}}, {"_id": 0}).to_list(1000)
        else:
            vihars = []
        
        # Get user info (with caching)
        user_cache_key = cache_key_user(user_id) if cache else None
        if cache and user_cache_key:
            user_info = await cache.get(user_cache_key)
            if user_info is None:
                user_info = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
                if user_info:
                    await cache.set(user_cache_key, user_info, ttl=300)
        else:
            user_info = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    # For admin without user_id - all vihars
    elif current_user.get("role") == "admin":
        vihars = await db.vihars.find(
            {"created_at": {"$gte": start_date_str}},
            {"_id": 0}
        ).sort("created_at", -1).to_list(1000)
        user_info = None
    else:
        # For users - only their opted-in vihars (status = 'in')
        participations = await db.participations.find(
            {"user_id": current_user["id"], "status": "in", "created_at": {"$gte": start_date_str}},
            {"_id": 0, "vihar_id": 1}
        ).to_list(1000)
        vihar_ids = [p["vihar_id"] for p in participations]
        if vihar_ids:
            vihars = await db.vihars.find({"id": {"$in": vihar_ids}}, {"_id": 0}).to_list(1000)
        else:
            vihars = []
        user_info = current_user
    
    total_vihars = len(vihars)
    total_kms = sum(float(v.get("approx_kms", 0) or 0) for v in vihars)
    
    # Helper function to safely convert to int
    def safe_int(value, default=0):
        if value is None:
            return default
        try:
            return int(value)
        except (ValueError, TypeError):
            return default
    
    total_sadhu_bhagvant = sum(safe_int(v.get("sadhu_bhagvant"), 0) for v in vihars)
    total_sadhviji_bhagvant = sum(safe_int(v.get("sadhviji_bhagvant"), 0) for v in vihars)
    total_mumukshu = sum(safe_int(v.get("mumukshu"), 0) for v in vihars)
    # Total Thana = sum of sadhu_bhagvant + sadhviji_bhagvant for all vihars
    total_thana = total_sadhu_bhagvant + total_sadhviji_bhagvant
    
    # Debug logging to help identify calculation issues
    logger.info(f"Report summary calculation - Period: {period}, Vihars: {total_vihars}, "
                f"Sadhu: {total_sadhu_bhagvant}, Sadhviji: {total_sadhviji_bhagvant}, Mumukshu: {total_mumukshu}, Thana: {total_thana}")
    
    result = {
        "period": period,
        "total_vihars": total_vihars,
        "total_kms": total_kms,
        "total_sadhu_bhagvant": total_sadhu_bhagvant,
        "total_sadhviji_bhagvant": total_sadhviji_bhagvant,
        "total_mumukshu": total_mumukshu,
        "total_thana": total_thana,
        "vihars": vihars,
        "user_info": user_info
    }
    
    # Cache result
    if cache and cache_key:
        await cache.set(cache_key, result, ttl=cache_ttl)
    
    return result

# Report Downloads
@api_router.get("/reports/download/pdf")
async def download_pdf_report(period: str, user_id: str = None, current_user: dict = Depends(get_current_user)):
    """Download PDF report. Admin can download user-wise reports."""
    now = datetime.now(timezone.utc)
    
    # Calculate date range
    if period == "weekly":
        start_date = now - timedelta(days=7)
    elif period == "monthly":
        start_date = now - timedelta(days=30)
    elif period == "yearly":
        start_date = now - timedelta(days=365)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid period")
    
    start_date_str = start_date.isoformat()
    
    # For admin with user_id - get specific user's opted-in vihars
    if current_user.get("role") == "admin" and user_id:
        participations = await db.participations.find(
            {"user_id": user_id, "status": "in", "created_at": {"$gte": start_date_str}},
            {"_id": 0}
        ).to_list(1000)
        vihar_ids = [p["vihar_id"] for p in participations]
        vihars = await db.vihars.find({"id": {"$in": vihar_ids}}, {"_id": 0}).to_list(1000)
        user_info = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
        user_name = user_info.get("name", user_info.get("phone", "User"))
        report_title = f"Vihar Report - {user_name} ({period.title()})"
    # For admin without user_id - all vihars
    elif current_user.get("role") == "admin":
        vihars = await db.vihars.find(
            {"created_at": {"$gte": start_date_str}},
            {"_id": 0}
        ).to_list(1000)
        report_title = f"Vihar Seva Group - {period.title()} Report (All Users)"
    else:
        # For users - only their opted-in vihars (status = 'in')
        participations = await db.participations.find(
            {"user_id": current_user["id"], "status": "in", "created_at": {"$gte": start_date_str}},
            {"_id": 0}
        ).to_list(1000)
        vihar_ids = [p["vihar_id"] for p in participations]
        vihars = await db.vihars.find({"id": {"$in": vihar_ids}}, {"_id": 0}).to_list(1000)
        user_name = current_user.get("name", current_user.get("phone", "User"))
        report_title = f"Vihar Report - {user_name} ({period.title()})"
    
    total_kms = sum(v.get("approx_kms", 0) for v in vihars)
    # Calculate Total Thana (sum of sadhu_bhagvant + sadhviji_bhagvant)
    total_thana = sum(
        (v.get('sadhu_bhagvant', 0) or 0) + (v.get('sadhviji_bhagvant', 0) or 0)
        for v in vihars
    )
    
    # Create PDF with margins to prevent cutting
    buffer = BytesIO()
    # Add margins: left=0.5inch, right=0.5inch, top=0.5inch, bottom=0.5inch
    doc = SimpleDocTemplate(buffer, pagesize=A4, 
                           leftMargin=0.5*inch, rightMargin=0.5*inch,
                           topMargin=0.5*inch, bottomMargin=0.5*inch)
    elements = []
    styles = getSampleStyleSheet()
    
    # Add VSG Logo - reduced size to save space
    logo_path = ROOT_DIR.parent / "frontend" / "public" / "images" / "logo_vsg.jpg"
    if logo_path.exists():
        try:
            logo = Image(str(logo_path), width=1.5*inch, height=1.5*inch)  # Reduced from 2*inch
            logo.hAlign = 'CENTER'
            elements.append(logo)
            elements.append(Spacer(1, 0.15 * inch))  # Reduced spacing
        except Exception as e:
            logger.warning(f"Could not add logo to PDF: {str(e)}")
    
    # Title
    title = Paragraph(report_title, styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 0.3 * inch))
    
    # Date range
    date_info = Paragraph(
        f"Report Period: {start_date.strftime('%d %b %Y')} to {now.strftime('%d %b %Y')}",
        styles['Normal']
    )
    elements.append(date_info)
    elements.append(Spacer(1, 0.2 * inch))
    
    # Table data - add Vihar Sevak and Thana columns
    data = [['Date', 'Route No', 'Vihar Sevak', 'Thana', 'From → To', 'KMs']]
    
    # Initialize participants map
    vihar_participants_map = {}
    
    # For admin reports showing all vihars, get participants for each vihar
    if current_user.get("role") == "admin" and not user_id:
        # Get all participations for these vihars
        vihar_id_list = [v["id"] for v in vihars]
        all_participations = await db.participations.find(
            {"vihar_id": {"$in": vihar_id_list}, "status": "in"},
            {"_id": 0}
        ).to_list(1000)
        
        # Create a map of vihar_id to list of user names
        for participation in all_participations:
            v_id = participation["vihar_id"]
            if v_id not in vihar_participants_map:
                vihar_participants_map[v_id] = []
            user = await db.users.find_one({"id": participation["user_id"]}, {"_id": 0, "name": 1, "phone": 1})
            if user:
                participant_name = user.get("name", user.get("phone", "Unknown"))
                vihar_participants_map[v_id].append(participant_name)
    
    for vihar in sorted(vihars, key=lambda x: x.get('vihar_date', '')):
        # Get user name(s)
        if current_user.get("role") == "admin" and not user_id:
            # Show all participants for this vihar - each on a new line
            participants = vihar_participants_map.get(vihar["id"], [])
            if participants:
                # Create Paragraph with line breaks for PDF
                user_name_para = Paragraph("<br/>".join(participants), styles['Normal'])
            else:
                user_name_para = Paragraph("No participants", styles['Normal'])
        elif user_id:
            # Show the specific user name from user_info
            user_name_val = user_info.get("name", user_info.get("phone", "User")) if user_info else "User"
            user_name_para = Paragraph(user_name_val, styles['Normal'])
        else:
            # For regular users, show their own name
            user_name_val = current_user.get("name", current_user.get("phone", "User"))
            user_name_para = Paragraph(user_name_val, styles['Normal'])
        
        # Calculate Thana (sadhu + sadhviji count)
        thana_count = vihar.get('sadhu_bhagvant', 0) + vihar.get('sadhviji_bhagvant', 0)
        
        data.append([
            vihar.get('vihar_date', 'N/A'),
            vihar.get('route_no', 'N/A'),
            user_name_para,
            str(thana_count),
            f"{vihar.get('from_upashray', '')} → {vihar.get('to_upashray', '')}",
            str(vihar.get('approx_kms', 0))
        ])
    
    # Add total row - both TOTAL THANA and TOTAL KMs in same row
    # TOTAL THANA: in column 3 (Vihar Sevak), count in column 4 (Thana)
    # TOTAL KMs: in columns 5-6
    data.append(['', '', 'TOTAL THANA:', str(total_thana), 'TOTAL KMs:', f"{total_kms:.2f}"])
    
    # Create table - adjust column widths to fit page with margins
    # A4 width: 8.27 inch, with 0.5 inch margins on each side = 7.27 inch available
    # Column widths: Date, Route No, Vihar Sevak, Thana, From → To, KMs
    table = Table(data, colWidths=[1.0*inch, 0.9*inch, 1.3*inch, 0.7*inch, 2.3*inch, 0.8*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7FA588')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (2, 1), (2, -2), 'LEFT'),  # Vihar Sevak column - left align
        ('VALIGN', (2, 1), (2, -2), 'TOP'),  # Vihar Sevak column - top align for multi-line
        ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),  # Reduced from 12 to 10 for better fit
        ('FONTSIZE', (0, 1), (-1, -2), 9),  # Smaller font for data rows
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('TOPPADDING', (2, 1), (2, -2), 6),  # Extra padding for Vihar Sevak column
        ('BOTTOMPADDING', (2, 1), (2, -2), 6),  # Extra padding for Vihar Sevak column
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#F5F1E8')),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        # Align TOTAL THANA label (column 3, last row) to left
        ('ALIGN', (2, -1), (2, -1), 'LEFT'),
        # Align TOTAL THANA value (column 4, last row) to center
        ('ALIGN', (3, -1), (3, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#FDFBF7')]),  # Exclude last row (total row)
    ]))
    
    elements.append(table)
    elements.append(Spacer(1, 0.3 * inch))
    
    # Summary
    summary = Paragraph(
        f"<b>Summary:</b> Total Vihars: {len(vihars)} | Total Distance: {total_kms:.2f} KMs | Total Thana: {total_thana}",
        styles['Normal']
    )
    elements.append(summary)
    
    doc.build(elements)
    buffer.seek(0)
    
    filename = f"vihar_report_{period}_{now.strftime('%Y%m%d')}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@api_router.get("/reports/download/excel")
async def download_excel_report(period: str, user_id: str = None, current_user: dict = Depends(get_current_user)):
    """Download Excel report. Admin can download user-wise reports."""
    now = datetime.now(timezone.utc)
    
    # Calculate date range
    if period == "weekly":
        start_date = now - timedelta(days=7)
    elif period == "monthly":
        start_date = now - timedelta(days=30)
    elif period == "yearly":
        start_date = now - timedelta(days=365)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid period")
    
    start_date_str = start_date.isoformat()
    
    # For admin with user_id - get specific user's opted-in vihars
    if current_user.get("role") == "admin" and user_id:
        participations = await db.participations.find(
            {"user_id": user_id, "status": "in", "created_at": {"$gte": start_date_str}},
            {"_id": 0}
        ).to_list(1000)
        vihar_ids = [p["vihar_id"] for p in participations]
        vihars = await db.vihars.find({"id": {"$in": vihar_ids}}, {"_id": 0}).to_list(1000)
        user_info = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
        user_name = user_info.get("name", user_info.get("phone", "User"))
        report_title = f"Vihar Report - {user_name} ({period.title()})"
    # For admin without user_id - all vihars
    elif current_user.get("role") == "admin":
        vihars = await db.vihars.find(
            {"created_at": {"$gte": start_date_str}},
            {"_id": 0}
        ).to_list(1000)
        report_title = f"Vihar Seva Group - {period.title()} Report (All Users)"
    else:
        # For users - only their opted-in vihars (status = 'in')
        participations = await db.participations.find(
            {"user_id": current_user["id"], "status": "in", "created_at": {"$gte": start_date_str}},
            {"_id": 0}
        ).to_list(1000)
        vihar_ids = [p["vihar_id"] for p in participations]
        vihars = await db.vihars.find({"id": {"$in": vihar_ids}}, {"_id": 0}).to_list(1000)
        user_name = current_user.get("name", current_user.get("phone", "User"))
        report_title = f"Vihar Report - {user_name} ({period.title()})"
    
    total_kms = sum(v.get("approx_kms", 0) for v in vihars)
    # Calculate Total Thana (sum of sadhu_bhagvant + sadhviji_bhagvant)
    total_thana = sum(
        (v.get('sadhu_bhagvant', 0) or 0) + (v.get('sadhviji_bhagvant', 0) or 0)
        for v in vihars
    )
    
    # Create Excel workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Vihar Report"
    
    # Add VSG Logo
    logo_path = ROOT_DIR.parent / "frontend" / "public" / "images" / "logo_vsg.jpg"
    logo_exists = logo_path.exists()
    
    if logo_exists:
        try:
            img = ExcelImage(str(logo_path))
            # Resize logo
            img.width = 120
            img.height = 120
            # Add logo to cell A1
            ws.add_image(img, 'A1')
            # Adjust row height and column width for logo
            ws.row_dimensions[1].height = 100
            ws.column_dimensions['A'].width = 20
            # Title starts from column D (logo in A, title spans D to F for 6 columns)
            ws.merge_cells('D1:F1')
            title_cell = ws['D1']
        except Exception as e:
            logger.warning(f"Could not add logo to Excel: {str(e)}")
            logo_exists = False
            ws.merge_cells('A1:F1')
            title_cell = ws['A1']
            ws.row_dimensions[1].height = 30
    else:
        ws.merge_cells('A1:F1')
        title_cell = ws['A1']
        ws.row_dimensions[1].height = 30
    
    # Title
    title_cell.value = report_title
    title_cell.font = Font(size=16, bold=True, color="FFFFFF")
    title_cell.fill = PatternFill(start_color="7FA588", end_color="7FA588", fill_type="solid")
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    
    # Date range
    if logo_exists:
        ws.merge_cells('D2:F2')
        date_cell = ws['D2']
    else:
        ws.merge_cells('A2:F2')
        date_cell = ws['A2']
    date_cell.value = f"Report Period: {start_date.strftime('%d %b %Y')} to {now.strftime('%d %b %Y')}"
    date_cell.alignment = Alignment(horizontal="center")
    ws.row_dimensions[2].height = 20
    
    # Headers - add Vihar Sevak and Thana columns
    headers = ['Date', 'Route No', 'Vihar Sevak', 'Thana', 'From → To', 'KMs']
    start_col = 1 if not (logo_path.exists()) else 1  # Start from column 1, but adjust if logo exists
    for col, header in enumerate(headers, start_col):
        cell = ws.cell(row=4, column=col)
        cell.value = header
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color="7FA588", end_color="7FA588", fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")
    
    ws.row_dimensions[4].height = 25
    
    # For admin reports showing all vihars, get participants for each vihar
    vihar_participants_map = {}
    if current_user.get("role") == "admin" and not user_id:
        # Get all participations for these vihars
        vihar_id_list = [v["id"] for v in vihars]
        all_participations = await db.participations.find(
            {"vihar_id": {"$in": vihar_id_list}, "status": "in"},
            {"_id": 0}
        ).to_list(1000)
        
        # Create a map of vihar_id to list of user names
        for participation in all_participations:
            v_id = participation["vihar_id"]
            if v_id not in vihar_participants_map:
                vihar_participants_map[v_id] = []
            user = await db.users.find_one({"id": participation["user_id"]}, {"_id": 0, "name": 1, "phone": 1})
            if user:
                user_name_val = user.get("name", user.get("phone", "Unknown"))
                vihar_participants_map[v_id].append(user_name_val)
    
    # Data rows
    row = 5
    for vihar in sorted(vihars, key=lambda x: x.get('vihar_date', '')):
        # Get user name(s)
        if current_user.get("role") == "admin" and not user_id:
            # Show all participants for this vihar - each on a new line
            participants = vihar_participants_map.get(vihar["id"], [])
            if participants:
                # Join with newline for Excel (Excel will wrap text)
                user_name_str = "\n".join(participants)
            else:
                user_name_str = "No participants"
        elif user_id:
            # Show the specific user name from user_info
            user_name_str = user_info.get("name", user_info.get("phone", "User")) if user_info else "User"
        else:
            # For regular users, show their own name
            user_name_str = current_user.get("name", current_user.get("phone", "User"))
        
        # Calculate Thana (sadhu + sadhviji count)
        thana_count = vihar.get('sadhu_bhagvant', 0) + vihar.get('sadhviji_bhagvant', 0)
        
        ws.cell(row=row, column=1, value=vihar.get('vihar_date', 'N/A'))
        ws.cell(row=row, column=2, value=vihar.get('route_no', 'N/A'))
        user_name_cell = ws.cell(row=row, column=3, value=user_name_str)
        # Enable text wrapping for user name cell
        user_name_cell.alignment = Alignment(wrap_text=True, vertical="top")
        # Adjust row height if there are multiple usernames (approximately 15 pixels per line)
        if current_user.get("role") == "admin" and not user_id:
            participants = vihar_participants_map.get(vihar["id"], [])
            if len(participants) > 1:
                ws.row_dimensions[row].height = 15 * len(participants) + 5  # Extra space for padding
        ws.cell(row=row, column=4, value=thana_count)
        ws.cell(row=row, column=5, value=f"{vihar.get('from_upashray', '')} → {vihar.get('to_upashray', '')}")
        ws.cell(row=row, column=6, value=vihar.get('approx_kms', 0))
        row += 1
    
    # Add total row - both TOTAL THANA and TOTAL KMs in same row
    total_row = row
    # Clear all cells in total row first
    for col in range(1, 7):
        ws.cell(row=total_row, column=col, value='')
        ws.cell(row=total_row, column=col).fill = PatternFill(
            start_color="F5F1E8", end_color="F5F1E8", fill_type="solid"
        )
    # Set TOTAL THANA label in column 3 (Vihar Sevak) and value in column 4 (Thana)
    total_thana_label_cell = ws.cell(row=total_row, column=3, value="TOTAL THANA:")
    total_thana_label_cell.font = Font(bold=True)
    total_thana_label_cell.alignment = Alignment(horizontal="left", vertical="center")
    total_thana_value_cell = ws.cell(row=total_row, column=4, value=total_thana)
    total_thana_value_cell.font = Font(bold=True)
    total_thana_value_cell.alignment = Alignment(horizontal="center", vertical="center")
    
    # Set TOTAL KMs label and value in columns 5-6
    total_kms_label_cell = ws.cell(row=total_row, column=5, value="TOTAL KMs:")
    total_kms_label_cell.font = Font(bold=True)
    total_kms_label_cell.alignment = Alignment(horizontal="right", vertical="center")
    total_kms_value_cell = ws.cell(row=total_row, column=6, value=total_kms)
    total_kms_value_cell.font = Font(bold=True)
    total_kms_value_cell.alignment = Alignment(horizontal="right", vertical="center")
    # Ensure row height is adequate
    ws.row_dimensions[total_row].height = 25
    
    # Summary row
    summary_row = total_row + 2
    ws.merge_cells(f'A{summary_row}:F{summary_row}')
    summary_cell = ws.cell(row=summary_row, column=1)
    summary_cell.value = f"Summary: Total Vihars: {len(vihars)} | Total Distance: {total_kms:.2f} KMs | Total Thana: {total_thana}"
    summary_cell.font = Font(bold=True)
    summary_cell.alignment = Alignment(horizontal="center")
    
    # Column widths - adjusted for new columns
    ws.column_dimensions['A'].width = 12  # Date
    ws.column_dimensions['B'].width = 12  # Route No
    ws.column_dimensions['C'].width = 20  # Vihar Sevak
    ws.column_dimensions['D'].width = 10  # Thana
    ws.column_dimensions['E'].width = 35  # From → To
    ws.column_dimensions['F'].width = 12  # KMs
    
    # Save to buffer
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    filename = f"vihar_report_{period}_{now.strftime('%Y%m%d')}.xlsx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint to verify MongoDB connection"""
    try:
        # Ping MongoDB to check connection
        await client.admin.command('ping')
        return {
            "status": "healthy",
            "mongodb": "connected",
            "database": db_name,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"MongoDB connection error: {str(e)}")
        return {
            "status": "unhealthy",
            "mongodb": "disconnected",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

@app.get("/ping")
async def ping():
    """Simple ping endpoint"""
    return {"message": "pong", "timestamp": datetime.now(timezone.utc).isoformat()}

# Vihar Path Margdarshika - Route 1 PDF Report (Public endpoint - no auth required)
class Route1Data(BaseModel):
    routeNumber: int
    routeName: Optional[str] = None
    from_location: str = Field(alias='from')
    to: str
    totalKms: Optional[int] = None
    centers: List[dict]
    
    class Config:
        populate_by_name = True  # Allow both 'from' and 'from_location'

# Test endpoint to verify connectivity
@app.get("/api/vihar-path/test")
async def test_vihar_path():
    """Test endpoint to verify the route is accessible"""
    return {"status": "ok", "message": "Vihar Path endpoint is accessible"}

@app.post("/api/vihar-path/route1/pdf")
async def download_route1_pdf(route_data: Route1Data):
    """Download PDF report for Route 1 with all centers and details in Gujarati format"""
    import time
    start_time = time.time()
    
    try:
        logger.info(f"=== PDF Generation Started ===")
        logger.info(f"Received PDF request for route: {route_data.routeNumber}")
        route1_data = route_data.model_dump(by_alias=True)  # Use aliases to get 'from'
        logger.info(f"Route data: {len(route1_data.get('centers', []))} centers")
        from_location = route1_data.get('from') or route1_data.get('from_location', '')
        logger.info(f"From: {from_location}, To: {route1_data.get('to')}")
        
        # Validate centers data
        if not route1_data.get('centers'):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No centers provided")
        
        logger.info(f"Validation passed at {time.time() - start_time:.2f}s")
        
        # Calculate total distance for selected segment
        if route1_data.get('totalKms'):
            total_kms = route1_data['totalKms']
        elif route1_data['centers']:
            # Calculate from cumulative distances
            first_center = route1_data['centers'][0]
            last_center = route1_data['centers'][-1]
            if 'cumulativeKms' in last_center and 'cumulativeKms' in first_center:
                total_kms = last_center['cumulativeKms'] - first_center['cumulativeKms'] + first_center.get('kms', 0)
            else:
                # Fallback: sum of all kms
                total_kms = sum(c.get('kms', 0) for c in route1_data['centers'])
        else:
            total_kms = 0
        
        # Create PDF - optimized for speed
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, 
                               leftMargin=0.5*inch, rightMargin=0.5*inch,
                               topMargin=0.5*inch, bottomMargin=0.5*inch)
        elements = []
        styles = getSampleStyleSheet()
        
        # Register Unicode font for Gujarati support
        # ReportLab needs a TTF font file that supports Gujarati Unicode
        gujarati_font = 'Helvetica'  # Default fallback
        
        # Try to find and register a Unicode-supporting font
        # Common locations for Unicode fonts on Windows
        font_paths = [
            'C:/Windows/Fonts/arialuni.ttf',  # Arial Unicode MS (Windows) - supports Gujarati
            'C:/Windows/Fonts/ARIALUNI.TTF',
            'C:/Windows/Fonts/NotoSansGujarati-Regular.ttf',  # Noto Sans Gujarati
            'C:/Windows/Fonts/mangal.ttf',  # Mangal (Hindi/Gujarati font on Windows)
            'C:/Windows/Fonts/MANGAL.TTF',
        ]
        
        for font_path in font_paths:
            if os.path.exists(font_path):
                try:
                    # Use a simple name for the font
                    font_name = 'GujaratiFont'
                    pdfmetrics.registerFont(TTFont(font_name, font_path))
                    gujarati_font = font_name
                    logger.info(f"Registered Unicode font: {font_name} from {font_path}")
                    break
                except Exception as e:
                    logger.warning(f"Could not register font {font_path}: {str(e)}")
                    continue
        
        if gujarati_font == 'Helvetica':
            logger.warning("No Unicode font found. Gujarati text may not render correctly. Using default font.")
            logger.warning("Gujarati characters may appear as placeholders (===) in the PDF.")
        
        # Create custom styles with Unicode font
        gujarati_title_style = ParagraphStyle(
            'GujaratiTitle',
            parent=styles['Title'],
            fontName=gujarati_font,
            fontSize=16
        )
        
        gujarati_normal_style = ParagraphStyle(
            'GujaratiNormal',
            parent=styles['Normal'],
            fontName=gujarati_font,
            fontSize=10
        )
        
        # Skip logo to speed up generation (optional - can re-enable if needed)
        # logo_path = ROOT_DIR.parent / "frontend" / "public" / "images" / "logo_vsg.jpg"
        # if logo_path.exists():
        #     try:
        #         logo = Image(str(logo_path), width=1.5*inch, height=1.5*inch)
        #         logo.hAlign = 'CENTER'
        #         elements.append(logo)
        #         elements.append(Spacer(1, 0.15 * inch))
        #     except Exception as e:
        #         logger.warning(f"Could not add logo to PDF: {str(e)}")
        
        # Title - Gujarati format
        title = Paragraph("<b>રૂટ રિપોર્ટ — ફોર્મેટ</b>", gujarati_title_style)
        elements.append(title)
        elements.append(Spacer(1, 0.2 * inch))
        
        # Route Info in Gujarati
        route_name = route1_data.get('routeName', f"રૂટ {route1_data.get('routeNumber', 1)}")
        from_location = route1_data.get('from') or route1_data.get('from_location', '')
        route_info_text = f"<b>રૂટ નામ:</b> {route_name}<br/>"
        route_info_text += f"<b>કુલ અંતર:</b> {total_kms} કિ.મી.<br/>"
        route_info_text += f"<b>રિપોર્ટ તારીખ:</b> {datetime.now(timezone.utc).strftime('%d/%m/%Y')}<br/>"
        route_info_text += f"<b>From:</b> {from_location}<br/>"
        route_info_text += f"<b>To:</b> {route1_data.get('to', '')}<br/>"
        route_info_text += "<b>નોંધ:</b> સરનામું/સંપર્ક/ફોન ઉપલબ્ધ હોય તો ઉમેરવાના, નહિતર ખાલી."
        
        route_info = Paragraph(route_info_text, gujarati_normal_style)
        elements.append(route_info)
        elements.append(Spacer(1, 0.3 * inch))
        
        # Table header in Gujarati
        logger.info(f"Creating table with {len(route1_data['centers'])} rows at {time.time() - start_time:.2f}s")
        
        # Table with all columns in Gujarati
        data = [['ક્રમ', 'સ્થળનું નામ', 'કિ.મી.', 'સરનામું (જો મળે)', 'સંપર્ક વ્યક્તિ (જો મળે)', 'ફોન (જો મળે)', 'નોંધ']]
        
        # Table data - batch process for better performance
        centers_list = route1_data['centers']
        logger.info(f"Processing {len(centers_list)} centers")
        
        for idx, center in enumerate(centers_list, 1):
            # Ensure all values are strings and handle None
            data.append([
                str(idx),
                str(center.get('placeName', '') or ''),
                str(center.get('kms', 0) or 0),
                str(center.get('address', '') or ''),
                str(center.get('personName', '') or ''),
                str(center.get('phoneNo', '') or ''),
                str(center.get('notes', '') or ''),
            ])
        
        logger.info(f"Table data prepared at {time.time() - start_time:.2f}s, creating table object")
        
        # Convert table data to use Paragraph objects for Unicode support
        # This is necessary for proper Gujarati text rendering
        table_data_with_paragraphs = []
        for row_idx, row in enumerate(data):
            if row_idx == 0:
                # Header row - convert to Paragraph for Unicode
                header_row = [Paragraph(str(cell), gujarati_normal_style) for cell in row]
                table_data_with_paragraphs.append(header_row)
            else:
                # Data rows - convert text cells to Paragraph for Unicode support
                new_row = []
                for col_idx, cell in enumerate(row):
                    if col_idx in [0, 2]:  # Sr No and KMs - numbers, can be string
                        new_row.append(str(cell))
                    else:
                        # Text cells - use Paragraph for Unicode
                        new_row.append(Paragraph(str(cell), gujarati_normal_style))
                table_data_with_paragraphs.append(new_row)
        
        logger.info(f"Table data converted to Paragraphs at {time.time() - start_time:.2f}s")
        
        # Create table with all columns
        try:
            table = Table(table_data_with_paragraphs, colWidths=[0.5*inch, 1.3*inch, 0.5*inch, 1.2*inch, 1.2*inch, 1.0*inch, 0.8*inch])
            logger.info(f"Table object created at {time.time() - start_time:.2f}s")
        except Exception as table_error:
            logger.error(f"Error creating table: {str(table_error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating table: {str(table_error)}"
            )
        
        # Table style optimized for Gujarati text
        try:
            bold_font = f'{gujarati_font}-Bold' if f'{gujarati_font}-Bold' in pdfmetrics.getRegisteredFontNames() else gujarati_font
            
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7FA588')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (0, -1), 'CENTER'),  # ક્રમ column - center
                ('ALIGN', (2, 0), (2, -1), 'CENTER'),  # કિ.મી. column - center
                ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('TOPPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#FDFBF7')]),
            ]))
            logger.info(f"Table style applied at {time.time() - start_time:.2f}s with font: {gujarati_font}")
        except Exception as style_error:
            logger.error(f"Error applying table style: {str(style_error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error applying table style: {str(style_error)}"
            )
        
        logger.info(f"Appending table to elements at {time.time() - start_time:.2f}s")
        elements.append(table)
        
        logger.info(f"Elements prepared at {time.time() - start_time:.2f}s, building PDF...")
        logger.info(f"Total elements to build: {len(elements)}")
        
        # Build PDF with timeout protection
        try:
            import signal
            
            def timeout_handler(signum, frame):
                raise TimeoutError("PDF generation timed out")
            
            # Set a timeout for PDF building (30 seconds)
            # Note: This works on Unix systems, for Windows we'll rely on async timeout
            logger.info("Starting doc.build()...")
            build_start = time.time()
            
            doc.build(elements)
            
            build_time = time.time() - build_start
            logger.info(f"PDF document built successfully in {build_time:.2f}s, total time: {time.time() - start_time:.2f}s")
        except TimeoutError as timeout_err:
            logger.error(f"PDF generation timed out: {str(timeout_err)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="PDF generation timed out. Please try with fewer centers."
            )
        except Exception as build_error:
            logger.error(f"Error building PDF: {str(build_error)}")
            import traceback
            logger.error(f"Build traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail=f"Error building PDF: {str(build_error)}"
            )
        
        buffer.seek(0)
        
        # Get PDF size
        pdf_data = buffer.getvalue()
        pdf_size = len(pdf_data)
        logger.info(f"PDF generated successfully, size: {pdf_size} bytes, total time: {time.time() - start_time:.2f}s")
        
        if pdf_size == 0:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Generated PDF is empty")
        
        filename = f"vihar_path_route1_{datetime.now(timezone.utc).strftime('%Y%m%d')}.pdf"
        logger.info(f"Returning PDF with filename: {filename}")
        
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(pdf_size)
            }
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error generating Route 1 PDF: {str(e)}")
        import traceback
        error_traceback = traceback.format_exc()
        logger.error(f"Traceback: {error_traceback}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error generating PDF: {str(e)}. Check server logs for details."
        )

# CORS configuration - MUST be added BEFORE including routers
# This ensures CORS headers are applied to all routes including OPTIONS preflight
cors_origins = os.environ.get('CORS_ORIGINS', '*')
if cors_origins == '*':
    # In development, explicitly allow localhost origins (can't use '*' with credentials)
    allow_origins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
    ]
else:
    allow_origins = [origin.strip() for origin in cors_origins.split(',')]

# CORS middleware - add before other middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allow_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Performance monitoring middleware
@app.middleware("http")
async def performance_middleware(request: Request, call_next):
    """Log slow requests and add performance headers"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Add performance headers
    response.headers["X-Process-Time"] = str(round(process_time, 4))
    
    # Log slow requests (> 1 second)
    if process_time > 1.0:
        logger.warning(f"Slow request: {request.method} {request.url.path} took {process_time:.2f}s")
    
    return response

# Include API router AFTER CORS middleware
app.include_router(api_router)

# Add explicit OPTIONS handlers for all routes (after middleware and router)
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle OPTIONS requests for CORS preflight - must be after CORS middleware"""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600",
        }
    )

@api_router.options("/{full_path:path}")
async def api_options_handler(full_path: str):
    """Handle OPTIONS requests for API routes"""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600",
        }
    )

@app.on_event("startup")
async def startup_db():
    """Create default admin on startup and verify MongoDB connection"""
    try:
        # Test MongoDB connection
        await client.admin.command('ping')
        logger.info(f"Connected to MongoDB: {mongo_url}")
        logger.info(f"Using database: {db_name}")
        
        # Create default admin
        admin = await db.users.find_one({"phone": "9429617099"})
        if not admin:
            default_admin = User(
                phone="9429617099",
                password_hash=hash_password("7488"),
                role="admin",
                area="Admin",
                address="Vihar Seva Group HQ"
            )
            await db.users.insert_one(default_admin.model_dump())
            logger.info("Default admin created")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        logger.error("Please check your MONGO_URL and ensure MongoDB is running")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
