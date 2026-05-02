from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import os

SECRET_KEY = os.getenv("SECRET_KEY", "changeme-use-a-real-secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class CurrentUser:
    def __init__(self, id: int, role: str):
        self.id = id
        self.role = role


def get_current_user(token: str = Depends(oauth2_scheme)) -> CurrentUser:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return CurrentUser(id=int(user_id), role=role)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_admin(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
