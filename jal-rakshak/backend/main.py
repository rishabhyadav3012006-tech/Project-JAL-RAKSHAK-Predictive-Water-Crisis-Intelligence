import os
import sys
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# Ensure proper paths
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(ROOT_DIR, "backend"))
sys.path.insert(0, os.path.join(ROOT_DIR, "ai-engine"))
sys.path.insert(0, os.path.join(ROOT_DIR, "iot-simulator"))

from app.core.config import settings
from app.api.routers import api_router
from app.websocket.manager import ws_manager
from app.database.session import init_db
from app.database.seed import seed_database
from app.services.realtime_processor import realtime_processor

async def background_telemetry_broadcaster():
    """Background task streaming real-time IoT telemetry ticks to connected WebSockets."""
    while True:
        try:
            await realtime_processor.process_live_tick()
        except asyncio.CancelledError:
            break
        except Exception as e:
            # Continue streaming gracefully
            pass
        await asyncio.sleep(2.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize database schemas, populate seed data, and start live broadcaster."""
    try:
        init_db()
        seed_database()
        print("[JAL-RAKSHAK Startup] Database tables verified and seed data active.")
    except Exception as e:
        print(f"[JAL-RAKSHAK Startup Error] Database initialization notice: {e}")

    # Launch background real-time broadcaster
    broadcaster_task = asyncio.create_task(background_telemetry_broadcaster())
    yield
    broadcaster_task.cancel()
    try:
        await broadcaster_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="JAL-RAKSHAK: Complete Smart Water Grid, Telemetry Intelligence & Hydraulic Digital Twin Management Platform",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers for structured JSON error responses
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "status_code": exc.status_code,
            "message": exc.detail,
            "path": request.url.path,
        },
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "validation_error",
            "status_code": 422,
            "message": "Invalid request parameters",
            "details": exc.errors(),
            "path": request.url.path,
        },
    )

# Mount Modular API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# Root landing endpoint
@app.get("/", tags=["Root"])
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "running",
        "docs": f"{settings.API_V1_STR}/docs",
        "health": f"{settings.API_V1_STR}/health",
        "api_prefix": settings.API_V1_STR,
    }

# Real-time WebSocket connection
@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                import json
                msg = json.loads(data)
                action = msg.get("action")
                if action == "pause":
                    await ws_manager.send_personal_message({"type": "PAUSE_ACK", "paused": True}, websocket)
                elif action == "resume":
                    await ws_manager.send_personal_message({"type": "RESUME_ACK", "paused": False}, websocket)
                else:
                    await ws_manager.send_personal_message({"type": "PONG", "received": msg}, websocket)
            except Exception:
                await ws_manager.send_personal_message({"type": "PONG", "raw": data}, websocket)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
