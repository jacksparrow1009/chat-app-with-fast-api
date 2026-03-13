from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db.database import get_db
from db.schemas import UserCreate, UserLogin
from services.auth import login_user as login_user_service
from services.auth import register_user as register_user_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    return register_user_service(db, user)


@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    return login_user_service(db, user)