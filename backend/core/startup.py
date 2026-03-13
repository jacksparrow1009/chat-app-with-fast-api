from sqlalchemy import inspect, text

from db import models
from db.database import engine


def initialize_database():
    models.Base.metadata.create_all(bind=engine)
    _ensure_message_receiver_column()


def _ensure_message_receiver_column():
    with engine.connect() as conn:
        inspector = inspect(engine)
        columns = [column["name"] for column in inspector.get_columns("messages")]
        if "receiver" not in columns:
            conn.execute(text("ALTER TABLE messages ADD COLUMN receiver VARCHAR"))
            conn.commit()