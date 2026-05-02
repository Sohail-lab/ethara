from sqlalchemy import Column, Integer, String, DateTime, Enum
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("admin", "member"), default="member", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
