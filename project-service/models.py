from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, nullable=False)
    role = Column(Enum("admin", "member"), default="member")

    project = relationship("Project", back_populates="members")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum("todo", "in-progress", "done"), default="todo")
    assigned_to = Column(Integer, nullable=True)
    due_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="tasks")
