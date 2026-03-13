import json
from typing import Dict

from fastapi import WebSocket

from db.database import SessionLocal
from db.models.message import Message as MessageModel


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections[username] = websocket
        await self.broadcast_online_users()

    async def disconnect(self, username: str, websocket: WebSocket):
        if self.active_connections.get(username) is websocket:
            self.active_connections.pop(username, None)
            await self.broadcast_online_users()

    async def send_to_user(self, username: str, message: str):
        ws = self.active_connections.get(username)
        if not ws:
            return

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
        await self.broadcast(json.dumps({"type": "online_users", "users": users}))

    def get_online_users(self) -> list:
        return list(self.active_connections.keys())


def create_message(sender: str, receiver: str, content: str) -> MessageModel:
    db = SessionLocal()
    try:
        db_message = MessageModel(sender=sender, receiver=receiver, content=content)
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        return db_message
    finally:
        db.close()


manager = ConnectionManager()