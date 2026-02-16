from db.database import Base
from .user import User
from .message import Message

# This makes it easy for other files to import everything at once
__all__ = ["Base", "User", "Message"]