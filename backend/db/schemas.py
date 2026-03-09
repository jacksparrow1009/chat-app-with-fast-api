from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True # This allows Pydantic to read SQLAlchemy models

class MessageResponse(BaseModel):
    id: int
    sender: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True