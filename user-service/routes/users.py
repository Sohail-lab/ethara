from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
import auth
from database import get_db

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


@router.get("", response_model=List[schemas.UserOut])
def list_users(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.User).all()


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
