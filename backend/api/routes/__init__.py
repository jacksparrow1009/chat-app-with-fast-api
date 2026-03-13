from api.routes.auth import router as auth_router
from api.routes.health import router as health_router
from api.routes.messages import router as messages_router
from api.routes.users import router as users_router
from api.routes.websocket import router as websocket_router

__all__ = [
    "auth_router",
    "health_router",
    "messages_router",
    "users_router",
    "websocket_router",
]