from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from db.models.message import Message as MessageModel


def get_direct_messages(db: Session, username: str, chat_partner: str, limit: int):
    return (
        db.query(MessageModel)
        .filter(
            or_(
                and_(MessageModel.sender == username, MessageModel.receiver == chat_partner),
                and_(MessageModel.sender == chat_partner, MessageModel.receiver == username),
            )
        )
        .order_by(MessageModel.timestamp.asc())
        .limit(limit)
        .all()
    )