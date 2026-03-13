from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import auth_router, health_router, messages_router, users_router, websocket_router
from core.config import settings
from core.startup import initialize_database


def create_app() -> FastAPI:
    initialize_database()

    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(auth_router)
    app.include_router(users_router)
    app.include_router(messages_router)
    app.include_router(websocket_router)
    return app