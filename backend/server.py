from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import httpx
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
from io import BytesIO

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'vihar-seva-group-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer()

# MSG91 Config
MSG91_AUTH_KEY = os.environ.get('MSG91_AUTH_KEY')
MSG91_BASE_URL = "https://control.msg91.com/api/v5"

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
    role: str = "user"  # admin or user
    password_hash: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Vihar(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    route_no: str
    gujarati_date: str
    sahebji_name: str
    vihar_date: str
    vihar_time: str
    sadhu_bhagvant: int
    wheelchair: bool = False
    luggage: bool = False
    car_required: bool = False
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

class ViharCreate(BaseModel):
    route_no: str
    gujarati_date: str
    sahebji_name: str
    vihar_date: str
    vihar_time: str
    sadhu_bhagvant: int
    wheelchair: bool = False
    luggage: bool = False
    car_required: bool = False
    from_upashray: str
    to_upashray: str
    approx_kms: float

class ParticipationUpdate(BaseModel):
    vihar_id: str
    status: str  # in or out

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

async def send_otp_msg91(phone: str) -> tuple[bool, str]:
    """Send OTP via MSG91 API"""
    try:
        # Format phone number for India
        clean_phone = phone.replace("+", "").replace(" ", "").replace("-", "")
        if not clean_phone.startswith("91"):
            clean_phone = "91" + clean_phone
        
        logger.info(f"Attempting to send OTP to: {clean_phone}")
        
        headers = {
            "authkey": MSG91_AUTH_KEY,
            "Content-Type": "application/json"
        }
        
        payload = {
            "mobile": clean_phone,
            "template_id": "your_template_id",  # You may need DLT template ID
            "otp_expiry": 10,
            "invisible": 0
        }
        
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            response = await http_client.post(
                f"{MSG91_BASE_URL}/otp",
                json=payload,
                headers=headers
            )
        
        logger.info(f"MSG91 Response Status: {response.status_code}")
        logger.info(f"MSG91 Response Body: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("type") == "success":
                logger.info(f"OTP sent successfully to {clean_phone}")
                return True, "OTP sent successfully"
            else:
                error_msg = data.get("message", "Failed to send OTP")
                logger.error(f"MSG91 error: {error_msg}")
                return False, error_msg
        else:
            logger.error(f"MSG91 HTTP error: {response.status_code} - {response.text}")
            return False, "Failed to send OTP. Please try again."
    except httpx.TimeoutException:
        logger.error(f"Timeout sending OTP to {phone}")
        return False, "Request timeout. Please try again."
    except Exception as e:
        logger.error(f"Error sending OTP to {phone}: {str(e)}")
        return False, f"Error: {str(e)}"

async def verify_otp_msg91(phone: str, otp: str) -> tuple[bool, str]:
    """Verify OTP via MSG91 API"""
    try:
        # Format phone number
        clean_phone = phone.replace("+", "").replace(" ", "").replace("-", "")
        if not clean_phone.startswith("91"):
            clean_phone = "91" + clean_phone
        
        logger.info(f"Attempting to verify OTP for: {clean_phone}")
        
        headers = {
            "authkey": MSG91_AUTH_KEY,
            "Content-Type": "application/json"
        }
        
        params = {
            "mobile": clean_phone,
            "otp": otp
        }
        
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            response = await http_client.get(
                f"{MSG91_BASE_URL}/otp/verify",
                params=params,
                headers=headers
            )
        
        logger.info(f"MSG91 Verify Response Status: {response.status_code}")
        logger.info(f"MSG91 Verify Response Body: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("type") == "success":
                logger.info(f"OTP verified successfully for {clean_phone}")
                return True, "OTP verified successfully"
            else:
                error_msg = data.get("message", "Invalid OTP")
                logger.warning(f"OTP verification failed: {error_msg}")
                return False, error_msg
        else:
            logger.error(f"MSG91 verify HTTP error: {response.status_code}")
            return False, "Verification failed. Please try again."
    except httpx.TimeoutException:
        logger.error(f"Timeout verifying OTP for {phone}")
        return False, "Request timeout. Please try again."
    except Exception as e:
        logger.error(f"Error verifying OTP for {phone}: {str(e)}")
        return False, f"Error: {str(e)}"

# ===== ROUTES =====

# Auth Routes
@api_router.post("/auth/send-otp")
async def send_otp(request: OTPRequest):
    """Send OTP to phone number"""
    success, message = await send_otp_msg91(request.phone)
    if success:
        return {"status": "success", "message": message}
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

@api_router.post("/auth/verify-otp")
async def verify_otp(request: OTPVerify):
    """Verify OTP"""
    success, message = await verify_otp_msg91(request.phone, request.otp)
    if success:
        # Check if user exists
        user = await db.users.find_one({"phone": request.phone}, {"_id": 0})
        if user:
            # Existing user login
            token = create_access_token({"sub": user["id"]})
            user_response = {k: v for k, v in user.items() if k != "password_hash"}
            return TokenResponse(access_token=token, user=user_response)
        else:
            # New user - return verified status
            return {"status": "verified", "message": "OTP verified. Please complete registration."}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=message)

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    """Register new user after OTP verification"""
    # Check if user exists
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
    
    token = create_access_token({"sub": user.id})
    user_response = {k: v for k, v in user_dict.items() if k != "password_hash"}
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Admin login with password"""
    user = await db.users.find_one({"phone": request.phone}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if user.get("role") == "admin" and request.password:
        if not verify_password(request.password, user.get("password_hash", "")):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    
    token = create_access_token({"sub": user["id"]})
    user_response = {k: v for k, v in user.items() if k != "password_hash"}
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
    """Get user's participated vihars"""
    participations = await db.participations.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).to_list(1000)
    
    vihar_ids = [p["vihar_id"] for p in participations]
    vihars = await db.vihars.find({"id": {"$in": vihar_ids}}, {"_id": 0}).to_list(1000)
    
    # Add participation status to each vihar
    participation_map = {p["vihar_id"]: p["status"] for p in participations}
    for vihar in vihars:
        vihar["user_status"] = participation_map.get(vihar["id"])
    
    return vihars

# Reports
@api_router.get("/reports/summary")
async def get_report_summary(period: str, current_user: dict = Depends(get_current_user)):
    """Get vihar reports - weekly, monthly, yearly"""
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
    
    # For admin - all vihars
    if current_user.get("role") == "admin":
        vihars = await db.vihars.find(
            {"created_at": {"$gte": start_date_str}},
            {"_id": 0}
        ).to_list(1000)
    else:
        # For users - only their participated vihars
        participations = await db.participations.find(
            {"user_id": current_user["id"], "created_at": {"$gte": start_date_str}},
            {"_id": 0}
        ).to_list(1000)
        vihar_ids = [p["vihar_id"] for p in participations]
        vihars = await db.vihars.find({"id": {"$in": vihar_ids}}, {"_id": 0}).to_list(1000)
    
    total_vihars = len(vihars)
    total_kms = sum(v.get("approx_kms", 0) for v in vihars)
    
    return {
        "period": period,
        "total_vihars": total_vihars,
        "total_kms": total_kms,
        "vihars": vihars
    }

# Report Downloads
@api_router.get("/reports/download/pdf")
async def download_pdf_report(period: str, current_user: dict = Depends(get_current_user)):
    """Download PDF report"""
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
    
    # For admin - all vihars, for users - only their vihars
    if current_user.get("role") == "admin":
        vihars = await db.vihars.find(
            {"created_at": {"$gte": start_date_str}},
            {"_id": 0}
        ).to_list(1000)
        report_title = f"Vihar Seva Group - {period.title()} Report (All Users)"
    else:
        participations = await db.participations.find(
            {"user_id": current_user["id"], "created_at": {"$gte": start_date_str}},
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
    ]))\n    \n    elements.append(table)\n    elements.append(Spacer(1, 0.3 * inch))\n    \n    # Summary\n    summary = Paragraph(\n        f\"<b>Summary:</b> Total Vihars: {len(vihars)} | Total Distance: {total_kms:.2f} KMs\",\n        styles['Normal']\n    )\n    elements.append(summary)\n    \n    doc.build(elements)\n    buffer.seek(0)\n    \n    filename = f\"vihar_report_{period}_{now.strftime('%Y%m%d')}.pdf\"\n    return StreamingResponse(\n        buffer,\n        media_type=\"application/pdf\",\n        headers={\"Content-Disposition\": f\"attachment; filename={filename}\"}\n    )\n\n@api_router.get(\"/reports/download/excel\")\nasync def download_excel_report(period: str, current_user: dict = Depends(get_current_user)):\n    \"\"\"Download Excel report\"\"\"\n    now = datetime.now(timezone.utc)\n    \n    # Calculate date range\n    if period == \"weekly\":\n        start_date = now - timedelta(days=7)\n    elif period == \"monthly\":\n        start_date = now - timedelta(days=30)\n    elif period == \"yearly\":\n        start_date = now - timedelta(days=365)\n    else:\n        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=\"Invalid period\")\n    \n    start_date_str = start_date.isoformat()\n    \n    # For admin - all vihars, for users - only their vihars\n    if current_user.get(\"role\") == \"admin\":\n        vihars = await db.vihars.find(\n            {\"created_at\": {\"$gte\": start_date_str}},\n            {\"_id\": 0}\n        ).to_list(1000)\n        report_title = f\"Vihar Seva Group - {period.title()} Report (All Users)\"\n    else:\n        participations = await db.participations.find(\n            {\"user_id\": current_user[\"id\"], \"created_at\": {\"$gte\": start_date_str}},\n            {\"_id\": 0}\n        ).to_list(1000)\n        vihar_ids = [p[\"vihar_id\"] for p in participations]\n        vihars = await db.vihars.find({\"id\": {\"$in\": vihar_ids}}, {\"_id\": 0}).to_list(1000)\n        user_name = current_user.get(\"name\", current_user.get(\"phone\", \"User\"))\n        report_title = f\"Vihar Report - {user_name} ({period.title()})\"\n    \n    total_kms = sum(v.get(\"approx_kms\", 0) for v in vihars)\n    \n    # Create Excel workbook\n    wb = Workbook()\n    ws = wb.active\n    ws.title = \"Vihar Report\"\n    \n    # Title\n    ws.merge_cells('A1:D1')\n    title_cell = ws['A1']\n    title_cell.value = report_title\n    title_cell.font = Font(size=16, bold=True, color=\"FFFFFF\")\n    title_cell.fill = PatternFill(start_color=\"7FA588\", end_color=\"7FA588\", fill_type=\"solid\")\n    title_cell.alignment = Alignment(horizontal=\"center\", vertical=\"center\")\n    ws.row_dimensions[1].height = 30\n    \n    # Date range\n    ws.merge_cells('A2:D2')\n    date_cell = ws['A2']\n    date_cell.value = f\"Report Period: {start_date.strftime('%d %b %Y')} to {now.strftime('%d %b %Y')}\"\n    date_cell.alignment = Alignment(horizontal=\"center\")\n    ws.row_dimensions[2].height = 20\n    \n    # Headers\n    headers = ['Date', 'Route No', 'From → To', 'KMs']\n    for col, header in enumerate(headers, 1):\n        cell = ws.cell(row=4, column=col)\n        cell.value = header\n        cell.font = Font(bold=True, color=\"FFFFFF\")\n        cell.fill = PatternFill(start_color=\"7FA588\", end_color=\"7FA588\", fill_type=\"solid\")\n        cell.alignment = Alignment(horizontal=\"center\", vertical=\"center\")\n    \n    ws.row_dimensions[4].height = 25\n    \n    # Data rows\n    row = 5\n    for vihar in sorted(vihars, key=lambda x: x.get('vihar_date', '')):\n        ws.cell(row=row, column=1, value=vihar.get('vihar_date', 'N/A'))\n        ws.cell(row=row, column=2, value=vihar.get('route_no', 'N/A'))\n        ws.cell(row=row, column=3, value=f\"{vihar.get('from_upashray', '')} → {vihar.get('to_upashray', '')}\")\n        ws.cell(row=row, column=4, value=vihar.get('approx_kms', 0))\n        row += 1\n    \n    # Total row\n    total_row = row\n    ws.cell(row=total_row, column=3, value=\"TOTAL KMs:\").font = Font(bold=True)\n    ws.cell(row=total_row, column=4, value=total_kms).font = Font(bold=True)\n    ws.cell(row=total_row, column=3).alignment = Alignment(horizontal=\"right\")\n    \n    # Style total row\n    for col in range(1, 5):\n        ws.cell(row=total_row, column=col).fill = PatternFill(\n            start_color=\"F5F1E8\", end_color=\"F5F1E8\", fill_type=\"solid\"\n        )\n    \n    # Summary row\n    summary_row = total_row + 2\n    ws.merge_cells(f'A{summary_row}:D{summary_row}')\n    summary_cell = ws.cell(row=summary_row, column=1)\n    summary_cell.value = f\"Summary: Total Vihars: {len(vihars)} | Total Distance: {total_kms:.2f} KMs\"\n    summary_cell.font = Font(bold=True)\n    summary_cell.alignment = Alignment(horizontal=\"center\")\n    \n    # Column widths\n    ws.column_dimensions['A'].width = 15\n    ws.column_dimensions['B'].width = 15\n    ws.column_dimensions['C'].width = 40\n    ws.column_dimensions['D'].width = 12\n    \n    # Save to buffer\n    buffer = BytesIO()\n    wb.save(buffer)\n    buffer.seek(0)\n    \n    filename = f\"vihar_report_{period}_{now.strftime('%Y%m%d')}.xlsx\"\n    return StreamingResponse(\n        buffer,\n        media_type=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\",\n        headers={\"Content-Disposition\": f\"attachment; filename={filename}\"}\n    )\n\napp.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db():
    """Create default admin on startup"""
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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
