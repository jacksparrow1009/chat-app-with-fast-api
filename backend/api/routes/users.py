from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.database import get_db
from db.schemas import UserResponse
from services.users import get_active_users
from utils.auth_utils import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=List[UserResponse])
def get_users(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ = current_user
    return get_active_users(db)