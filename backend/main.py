from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
from db.database import get_db
from models.models import Message as MessageModel

app = FastAPI()

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