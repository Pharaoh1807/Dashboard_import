from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from database import db
from auth import get_current_admin, get_password_hash

router = APIRouter()

class UserResponse(BaseModel):
    id: str
    _id: str # Include both for compatibility
    username: str
    email: Optional[str] = None
    is_approved: bool
    role: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    is_approved: Optional[bool] = None

@router.get("/users", response_model=List[UserResponse])
async def list_users(current_admin: dict = Depends(get_current_admin)):
    cursor = db.users.find({})
    users = await cursor.to_list(length=1000)
    
    return [
        UserResponse(
            id=u["_id"], 
            _id=u["_id"],
            username=u["username"], 
            email=u.get("email"), 
            is_approved=u.get("is_approved", False),
            role=u["role"]
        )
        for u in users
    ]

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user_update: UserUpdate, current_admin: dict = Depends(get_current_admin)):
    existing_user = await db.users.find_one({"_id": user_id})
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = {}
    if user_update.email is not None:
        update_data["email"] = user_update.email
    if user_update.role is not None:
        if user_id == current_admin["_id"] and user_update.role != "admin":
             raise HTTPException(status_code=400, detail="Cannot demote yourself from admin")
        update_data["role"] = user_update.role
    if user_update.is_approved is not None:
        update_data["is_approved"] = user_update.is_approved
        
    if update_data:
        await db.users.update_one({"_id": user_id}, {"$set": update_data})
        
    updated_user = await db.users.find_one({"_id": user_id})
    return UserResponse(
        id=updated_user["_id"], 
        _id=updated_user["_id"],
        username=updated_user["username"], 
        email=updated_user.get("email"),
        is_approved=updated_user.get("is_approved", False),
        role=updated_user["role"]
    )

class UserPasswordUpdate(BaseModel):
    password: str

@router.put("/users/{user_id}/password")
async def update_user_password(user_id: str, password_update: UserPasswordUpdate, current_admin: dict = Depends(get_current_admin)):
    existing_user = await db.users.find_one({"_id": user_id})
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    hashed_password = get_password_hash(password_update.password)
    await db.users.update_one({"_id": user_id}, {"$set": {"hashed_password": hashed_password}})
    
    return {"message": "Password updated successfully"}

@router.get("/users/{user_id}/files")
async def get_user_files(user_id: str, current_admin: dict = Depends(get_current_admin)):
    files = await db.files.find({"user_id": user_id}).to_list(length=100)
    return files

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_admin: dict = Depends(get_current_admin)):
    if user_id == current_admin["_id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
        
    result = await db.users.delete_one({"_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Xoá luôn các file của user này
    await db.files.delete_many({"user_id": user_id})
    # Ở một hệ thống thực tế chúng ta có thể xoá luôn records nhưng vì quá nhiều db.records,
    # nên có thể dùng job dọn dẹp hoặc xoá trực tiếp (có thể chậm)
    # await db.records.delete_many({"file_id": {"$in": user_files}})
    
    return {"message": "User deleted"}
