from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: Optional[str] = "member"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut
