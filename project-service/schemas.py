from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class MemberAdd(BaseModel):
    user_id: int
    role: Optional[str] = "member"


class ProjectMemberOut(BaseModel):
    user_id: int
    role: str

    class Config:
        from_attributes = True


class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    owner_id: int
    created_at: datetime
    members: List[ProjectMemberOut] = []

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    due_date: Optional[date] = None


class TaskStatusUpdate(BaseModel):
    status: str


class TaskOut(BaseModel):
    id: int
    project_id: int
    title: str
    description: Optional[str]
    status: str
    assigned_to: Optional[int]
    due_date: Optional[date]
    created_at: datetime

    class Config:
        from_attributes = True
