from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from typing import List
from db.models.user import User
from db.database import get_db
from db.models.message import Message as MessageModel
from sqlalchemy.orm import Session
from utils.auth_utils import hash_password
from db.database import get_db, engine
from db.schemas import UserCreate
from fastapi.middleware.cors import CORSMiddleware

from db import models  # This triggers the imports in models/__init__.py

# Now SQLAlchemy "sees" User and Message
models.Base.metadata.create_all(bind=engine)
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Your Next.js URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        # List to store active websocket connections
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        # Send message to all connected users
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await manager.connect(websocket)
    try:
        # Notify everyone that a new user joined
        await manager.broadcast(f"System: {username} has joined the chat")
        while True:
            # Wait for messages from the client
            data = await websocket.receive_text()
            db_message = MessageModel(sender=username, content=data)
            db = next(get_db())
            db.add(db_message)
            db.commit()
            # Broadcast the message to everyone
            await manager.broadcast(f"{username}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"System: {username} has left the chat")

@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Hash the password and save
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user_id": new_user.id}