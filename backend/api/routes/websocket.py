import json

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from services.chat import create_message, manager
from utils.auth_utils import verify_token

router = APIRouter(prefix="/api", tags=["websocket"])


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
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
                await manager.send_to_user(
                    receiver,
                    json.dumps({"type": "typing", "sender": username}),
                )
                continue

            if not receiver or not content:
                continue

            db_message = create_message(sender=username, receiver=receiver, content=content)
            message_json = json.dumps(
                {
                    "type": "message",
                    "id": db_message.id,
                    "sender": username,
                    "receiver": receiver,
                    "content": content,
                    "timestamp": db_message.timestamp.isoformat(),
                }
            )

            await manager.send_to_user(username, message_json)
            if receiver != username:
                await manager.send_to_user(receiver, message_json)
    except WebSocketDisconnect:
        await manager.disconnect(username, websocket)