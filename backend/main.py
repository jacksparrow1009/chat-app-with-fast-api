import sys
import os
import json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Query
from typing import Dict, List
from db.models.user import User
from db.database import get_db
from db.models.message import Message as MessageModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from utils.auth_utils import hash_password, verify_password, create_access_token, verify_token, get_current_user
from db.database import get_db, engine
from db.schemas import UserCreate, UserLogin, UserResponse, MessageResponse
from fastapi.middleware.cors import CORSMiddleware

from db import models  # This triggers the imports in models/__init__.py

# Now SQLAlchemy "sees" User and Message
models.Base.metadata.create_all(bind=engine)

# Add 'receiver' column if it doesn't exist (lightweight migration)
from sqlalchemy import text, inspect
with engine.connect() as conn:
    inspector = inspect(engine)
    columns = [c["name"] for c in inspector.get_columns("messages")]
    if "receiver" not in columns:
        conn.execute(text("ALTER TABLE messages ADD COLUMN receiver VARCHAR"))
        conn.commit()

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
        self.active_connections: Dict[str, WebSocket] = {}  # username -> websocket

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections[username] = websocket
        await self.broadcast_online_users()

    async def disconnect(self, username: str, websocket: WebSocket):
        # Only remove if the stored connection is the same object
        if self.active_connections.get(username) is websocket:
            self.active_connections.pop(username, None)
            await self.broadcast_online_users()

    async def send_to_user(self, username: str, message: str):
        ws = self.active_connections.get(username)
        if ws:
            try:
                await ws.send_text(message)
            except Exception:
                self.active_connections.pop(username, None)

    async def broadcast(self, message: str):
        for ws in list(self.active_connections.values()):
            try:
                await ws.send_text(message)
            except Exception:
                pass

    async def broadcast_online_users(self):
        users = list(self.active_connections.keys())
        await self.broadcast(json.dumps({
            "type": "online_users",
            "users": users,
        }))

    def get_online_users(self) -> list:
        return list(self.active_connections.keys())

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

    await manager.connect(websocket, username)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg_data = json.loads(data)
                receiver = msg_data.get("receiver")
                content = msg_data.get("content", "")
            except json.JSONDecodeError:
                continue

            msg_type = msg_data.get("type", "message")

            if msg_type == "typing" and receiver:
                await manager.send_to_user(receiver, json.dumps({
                    "type": "typing",
                    "sender": username,
                }))
                continue

            if not receiver or not content:
                continue

            # Save to database
            db = next(get_db())
            try:
                db_message = MessageModel(sender=username, receiver=receiver, content=content)
                db.add(db_message)
                db.commit()
                db.refresh(db_message)
            finally:
                db.close()

            message_json = json.dumps({
                "type": "message",
                "id": db_message.id,
                "sender": username,
                "receiver": receiver,
                "content": content,
                "timestamp": db_message.timestamp.isoformat(),
            })

            # Send to both sender and receiver
            await manager.send_to_user(username, message_json)
            if receiver != username:
                await manager.send_to_user(receiver, message_json)
    except WebSocketDisconnect:
        await manager.disconnect(username, websocket)

# --- Message Endpoints ---

@app.get("/api/messages/{chat_partner}", response_model=List[MessageResponse])
def get_dm_messages(
    chat_partner: str,
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    username = current_user["username"]
    messages = (
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