from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
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

# Add OPTIONS handler for CORS preflight
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle OPTIONS requests for CORS preflight"""
    return {"message": "OK"}

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
    gujarati_date: str
    sahebji_name: str = ""  # Optional field, defaults to empty string
    vihar_date: str
    vihar_time: str
    sadhu_bhagvant: int
    wheelchair: bool = False
    luggage: bool = False
    dori: bool = False
    car_required: bool = False
    activa: bool = False
    from_upashray: str
    to_upashray: str
    approx_kms: float
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    created_by: str  # admin id

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
    gujarati_date: str
    sahebji_name: str = ""  # Optional field
    vihar_date: str
    vihar_time: str
    sadhu_bhagvant: int
    wheelchair: bool = False
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
    user_id: str
    role: str

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
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
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
    result = await db.users.update_one(
        {"id": role_data.user_id},
        {"$set": {"role": role_data.role}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"status": "success", "message": "Role updated"}

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
async def create_vihar(vihar_data: ViharCreate, admin: dict = Depends(get_admin_user)):
    """Create new vihar (Admin only)"""
    try:
        vihar = Vihar(**vihar_data.model_dump(), created_by=admin["id"])
        vihar_dict = vihar.model_dump()
        await db.vihars.insert_one(vihar_dict)
        logger.info(f"Vihar created successfully: {vihar.id}")
        return vihar_dict
    except Exception as e:
        logger.error(f"Error creating vihar: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@api_router.put("/vihars/{vihar_id}", dependencies=[Depends(get_admin_user)])
async def update_vihar(vihar_id: str, vihar_data: ViharCreate, admin: dict = Depends(get_admin_user)):
    """Update vihar (Admin only)"""
    try:
        # Check if vihar exists
        existing_vihar = await db.vihars.find_one({"id": vihar_id})
        if not existing_vihar:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vihar not found")
        
        # Update vihar - preserve created_at and created_by
        update_data = vihar_data.model_dump()
        # Don't update created_at and created_by
        update_data.pop('created_at', None)
        update_data.pop('created_by', None)
        
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
    
    # Create PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    styles = getSampleStyleSheet()
    
    # Add VSG Logo
    logo_path = ROOT_DIR.parent / "frontend" / "public" / "images" / "logo_vsg.jpg"
    if logo_path.exists():
        try:
            logo = Image(str(logo_path), width=2*inch, height=2*inch)
            logo.hAlign = 'CENTER'
            elements.append(logo)
            elements.append(Spacer(1, 0.2 * inch))
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
    
    # Table data
    data = [['Date', 'Route No', 'From → To', 'KMs']]
    
    for vihar in sorted(vihars, key=lambda x: x.get('vihar_date', '')):
        data.append([
            vihar.get('vihar_date', 'N/A'),
            vihar.get('route_no', 'N/A'),
            f"{vihar.get('from_upashray', '')} → {vihar.get('to_upashray', '')}",
            str(vihar.get('approx_kms', 0))
        ])
    
    # Add total row
    data.append(['', '', 'TOTAL KMs:', f"{total_kms:.2f}"])
    
    # Create table
    table = Table(data, colWidths=[1.5*inch, 1.2*inch, 3*inch, 1*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7FA588')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
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
            # Title starts from column D
            ws.merge_cells('D1:F1')
            title_cell = ws['D1']
        except Exception as e:
            logger.warning(f"Could not add logo to Excel: {str(e)}")
            logo_exists = False
            ws.merge_cells('A1:D1')
            title_cell = ws['A1']
            ws.row_dimensions[1].height = 30
    else:
        ws.merge_cells('A1:D1')
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
        ws.merge_cells('A2:D2')
        date_cell = ws['A2']
    date_cell.value = f"Report Period: {start_date.strftime('%d %b %Y')} to {now.strftime('%d %b %Y')}"
    date_cell.alignment = Alignment(horizontal="center")
    ws.row_dimensions[2].height = 20
    
    # Headers
    headers = ['Date', 'Route No', 'From → To', 'KMs']
    start_col = 1 if not (logo_path.exists()) else 1  # Start from column 1, but adjust if logo exists
    for col, header in enumerate(headers, start_col):
        cell = ws.cell(row=4, column=col)
        cell.value = header
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color="7FA588", end_color="7FA588", fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")
    
    ws.row_dimensions[4].height = 25
    
    # Data rows
    row = 5
    for vihar in sorted(vihars, key=lambda x: x.get('vihar_date', '')):
        ws.cell(row=row, column=1, value=vihar.get('vihar_date', 'N/A'))
        ws.cell(row=row, column=2, value=vihar.get('route_no', 'N/A'))
        ws.cell(row=row, column=3, value=f"{vihar.get('from_upashray', '')} → {vihar.get('to_upashray', '')}")
        ws.cell(row=row, column=4, value=vihar.get('approx_kms', 0))
        row += 1
    
    # Total row
    total_row = row
    ws.cell(row=total_row, column=3, value="TOTAL KMs:").font = Font(bold=True)
    ws.cell(row=total_row, column=4, value=total_kms).font = Font(bold=True)
    ws.cell(row=total_row, column=3).alignment = Alignment(horizontal="right")
    
    # Style total row
    for col in range(1, 5):
        ws.cell(row=total_row, column=col).fill = PatternFill(
            start_color="F5F1E8", end_color="F5F1E8", fill_type="solid"
        )
    
    # Summary row
    summary_row = total_row + 2
    ws.merge_cells(f'A{summary_row}:D{summary_row}')
    summary_cell = ws.cell(row=summary_row, column=1)
    summary_cell.value = f"Summary: Total Vihars: {len(vihars)} | Total Distance: {total_kms:.2f} KMs"
    summary_cell.font = Font(bold=True)
    summary_cell.alignment = Alignment(horizontal="center")
    
    # Column widths
    ws.column_dimensions['A'].width = 15
    ws.column_dimensions['B'].width = 15
    ws.column_dimensions['C'].width = 40
    ws.column_dimensions['D'].width = 12
    
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
    allow_origins = ['*']
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
