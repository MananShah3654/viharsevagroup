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
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.units import inch
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
from openpyxl.drawing.image import Image as ExcelImage
from io import BytesIO

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
# URL encode password if provided via env, otherwise use default with encoded password
default_mongo_url = 'mongodb+srv://carboncredits:' + quote_plus('Riaana123') + '@clustercc.g83djvn.mongodb.net/?appName=ClusterCC'
mongo_url = os.environ.get('MONGO_URL', default_mongo_url)
db_name = os.environ.get('DB_NAME', 'ClusterCC')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'vihar-seva-group-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer()

# Removed MSG91 - Simple login with phone/password

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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
    wheelchair: int = 0  # Wheelchair count (0 = not required, >0 = count required)
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

class UserUpdate(BaseModel):
    name: Optional[str] = None
    photo: Optional[str] = None
    age: Optional[int] = None
    area: Optional[str] = None
    address: Optional[str] = None
    car: Optional[bool] = None
    password: Optional[str] = None

class ViharCreate(BaseModel):
    route_no: str
    gujarati_date: str = ""  # Optional field (removed from form)
    sahebji_name: str = ""  # Sadhu Bhagvant name (optional field)
    vihar_date: str
    vihar_time: str
    sadhu_bhagvant: int  # Sadhu Bhagvant count
    sadhviji_bhagvant: int = 0  # Sadhviji Bhagvant count
    wheelchair: int = 0  # Wheelchair count (0 = not required, >0 = count required)
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
        role="user"
    )
    
    user_dict = user.model_dump()
    await db.users.insert_one(user_dict)
    
    # Create token and return user
    token = create_access_token({"sub": user.id})
    user_response = {k: v for k, v in user_dict.items() if k != "password_hash"}
    return TokenResponse(access_token=token, user=user_response)

# User Routes
@api_router.get("/users/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    user_response = {k: v for k, v in current_user.items() if k != "password_hash"}
    return user_response

@api_router.put("/users/me")
async def update_user_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        await db.users.update_one({"id": current_user["id"]}, {"$set": update_dict})
    updated_user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0, "password_hash": 0})
    return updated_user

# Admin Routes - User Management
@api_router.get("/admin/users", dependencies=[Depends(get_admin_user)])
async def get_all_users():
    """Get all users (Admin only)"""
    # Include both _id and id in query so we can ensure consistency
    users_cursor = db.users.find({}, {"password_hash": 0})
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
@api_router.post("/vihars", dependencies=[Depends(get_admin_user)])
async def create_vihar(vihar_data: ViharCreate, request: Request, admin: dict = Depends(get_admin_user)):
    """Create new vihar (Admin only)"""
    try:
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
        logger.info(f"Vihar created successfully: {vihar.id}")
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
async def get_all_vihars(current_user: dict = Depends(get_current_user)):
    """Get all vihars - users see limited details"""
    vihars = await db.vihars.find({}, {"_id": 0}).to_list(1000)
    
    # For each vihar, get participation info
    for vihar in vihars:
        participation = await db.participations.find_one(
            {"vihar_id": vihar["id"], "user_id": current_user["id"]},
            {"_id": 0}
        )
        vihar["user_status"] = participation["status"] if participation else None
    
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
    
    # If admin, get all participants
    if current_user.get("role") == "admin":
        participants = await db.participations.find({"vihar_id": vihar_id}, {"_id": 0}).to_list(1000)
        vihar["participants"] = participants
    
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
    
    return {
        "status": "success",
        "message": f"Assigned {assigned_count} user(s) to vihar",
        "assigned_count": assigned_count,
        "errors": errors if errors else None
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
    """Get vihar reports - weekly, monthly, yearly. Admin can get user-wise reports."""
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
    
    # For admin with user_id filter - get specific user's vihars
    if current_user.get("role") == "admin" and user_id:
        participations = await db.participations.find(
            {"user_id": user_id, "created_at": {"$gte": start_date_str}},
            {"_id": 0}
        ).to_list(1000)
        vihar_ids = [p["vihar_id"] for p in participations]
        vihars = await db.vihars.find({"id": {"$in": vihar_ids}}, {"_id": 0}).to_list(1000)
        
        # Get user info
        user_info = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    # For admin without user_id - all vihars
    elif current_user.get("role") == "admin":
        vihars = await db.vihars.find(
            {"created_at": {"$gte": start_date_str}},
            {"_id": 0}
        ).to_list(1000)
        user_info = None
    else:
        # For users - only their opted-in vihars (status = 'in')
        participations = await db.participations.find(
            {"user_id": current_user["id"], "status": "in", "created_at": {"$gte": start_date_str}},
            {"_id": 0}
        ).to_list(1000)
        vihar_ids = [p["vihar_id"] for p in participations]
        vihars = await db.vihars.find({"id": {"$in": vihar_ids}}, {"_id": 0}).to_list(1000)
        user_info = current_user
    
    total_vihars = len(vihars)
    total_kms = sum(v.get("approx_kms", 0) for v in vihars)
    
    return {
        "period": period,
        "total_vihars": total_vihars,
        "total_kms": total_kms,
        "vihars": vihars,
        "user_info": user_info
    }

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
    
    # Add total row - ensure all 6 columns are present
    data.append(['', '', '', '', 'TOTAL KMs:', f"{total_kms:.2f}"])
    
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
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#FDFBF7')]),
    ]))
    
    elements.append(table)
    elements.append(Spacer(1, 0.3 * inch))
    
    # Summary
    summary = Paragraph(
        f"<b>Summary:</b> Total Vihars: {len(vihars)} | Total Distance: {total_kms:.2f} KMs",
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
    
    # Total row
    total_row = row
    # Clear all cells in total row first
    for col in range(1, 7):
        ws.cell(row=total_row, column=col, value='')
        ws.cell(row=total_row, column=col).fill = PatternFill(
            start_color="F5F1E8", end_color="F5F1E8", fill_type="solid"
        )
    # Set TOTAL KMs label and value
    total_label_cell = ws.cell(row=total_row, column=5, value="TOTAL KMs:")
    total_label_cell.font = Font(bold=True)
    total_label_cell.alignment = Alignment(horizontal="right", vertical="center")
    total_value_cell = ws.cell(row=total_row, column=6, value=total_kms)
    total_value_cell.font = Font(bold=True)
    total_value_cell.alignment = Alignment(horizontal="right", vertical="center")
    # Ensure row height is adequate
    ws.row_dimensions[total_row].height = 25
    
    # Summary row
    summary_row = total_row + 2
    ws.merge_cells(f'A{summary_row}:F{summary_row}')
    summary_cell = ws.cell(row=summary_row, column=1)
    summary_cell.value = f"Summary: Total Vihars: {len(vihars)} | Total Distance: {total_kms:.2f} KMs"
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

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allow_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

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
