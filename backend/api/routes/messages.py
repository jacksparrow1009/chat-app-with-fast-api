from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from db.database import get_db
from db.schemas import MessageResponse
from services.messages import get_direct_messages
from utils.auth_utils import get_current_user

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.get("/{chat_partner}", response_model=List[MessageResponse])
def get_dm_messages(
    chat_partner: str,
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    username = current_user["username"]
    return get_direct_messages(db, username=username, chat_partner=chat_partner, limit=limit)