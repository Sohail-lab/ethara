from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
import auth
from database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.UserOut, status_code=201)
def signup(data: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    if data.role not in ("admin", "member"):
        raise HTTPException(status_code=400, detail="Role must be admin or member")

    user = models.User(
        email=data.email,
        name=data.name,
        password_hash=auth.hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.Token)
def login(data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not auth.verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = auth.create_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}
