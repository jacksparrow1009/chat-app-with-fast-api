from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from db.database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String, nullable=False)
    receiver = Column(String, nullable=True)  # null for legacy/system messages
    content = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)