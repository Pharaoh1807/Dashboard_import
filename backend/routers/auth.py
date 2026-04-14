from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from database import db
from auth import get_password_hash, verify_password, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
import uuid
from typing import Optional

router = APIRouter()

class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[EmailStr] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    is_approved: bool
    role: str

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    new_user = {
        "_id": user_id,
        "username": user.username,
        "email": user.email,
        "hashed_password": get_password_hash(user.password),
        "is_approved": False, # Requires admin approval
        "role": "user" # default role
    }
    
    await db.users.insert_one(new_user)
    
    return UserResponse(id=user_id, username=user.username, email=user.email, is_approved=False, role=new_user["role"])


@router.post("/login")
async def login(user_credentials: UserLogin):
    user = await db.users.find_one({"username": user_credentials.username})
    
    if not user or not verify_password(user_credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": user["_id"],
            "username": user["username"],
            "email": user.get("email"),
            "is_approved": user.get("is_approved", False),
            "role": user["role"]
        }
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["_id"], 
        username=current_user["username"], 
        email=current_user.get("email"),
        is_approved=current_user.get("is_approved", False),
        role=current_user["role"]
    )
