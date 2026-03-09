import sys
import os
import json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Query
from typing import List
from db.models.user import User
from db.database import get_db
from db.models.message import Message as MessageModel
from sqlalchemy.orm import Session
from utils.auth_utils import hash_password, verify_password, create_access_token, verify_token, get_current_user
from db.database import get_db, engine
from db.schemas import UserCreate, UserLogin, UserResponse, MessageResponse
from fastapi.middleware.cors import CORSMiddleware

from db import models  # This triggers the imports in models/__init__.py

# Now SQLAlchemy "sees" User and Message
models.Base.metadata.create_all(bind=engine)
app = FastAPI()


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://chat-app-with-fast-api.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    # Verify JWT before accepting connection
    try:
        payload = verify_token(token)
        username = payload.get("username")
        if not username:
            await websocket.close(code=4001)
            return
    except Exception:
        await websocket.close(code=4001)
        return

    await manager.connect(websocket)
    try:
        # Notify everyone that a new user joined
        await manager.broadcast(json.dumps({
            "type": "system",
            "content": f"{username} has joined the chat",
        }))
        while True:
            data = await websocket.receive_text()
            # Save to database
            db = next(get_db())
            db_message = MessageModel(sender=username, content=data)
            db.add(db_message)
            db.commit()
            db.refresh(db_message)
            # Broadcast as JSON
            await manager.broadcast(json.dumps({
                "type": "message",
                "id": db_message.id,
                "sender": username,
                "content": data,
                "timestamp": db_message.timestamp.isoformat(),
            }))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(json.dumps({
            "type": "system",
            "content": f"{username} has left the chat",
        }))

# --- Message Endpoints ---

@app.get("/api/messages", response_model=List[MessageResponse])
def get_messages(
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(MessageModel)
        .order_by(MessageModel.timestamp.asc())
        .limit(limit)
        .all()
    )
    return messages

# --- User Endpoints ---

@app.get("/api/users", response_model=List[UserResponse])
def get_users(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    users = db.query(User).filter(User.is_active == True).all()
    return users

# --- Auth Endpoints ---

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user_id": new_user.id}

@app.post("/api/auth/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": db_user.email, "username": db_user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": db_user.username,
    }