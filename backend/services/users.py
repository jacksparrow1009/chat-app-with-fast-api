from sqlalchemy.orm import Session

from db.models.user import User


def get_active_users(db: Session):
    return db.query(User).filter(User.is_active == True).all()