"""WebSocket Connection Manager for Real-Time Telemetry and Event Broadcasting."""
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import WebSocket

logger = logging.getLogger("JalRakshakWS")

class ConnectionManager:
    """Manages active WebSocket connections for live telemetry, alerts, and digital twin sync."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.last_broadcast_timestamp: Optional[str] = None
        self.total_messages_broadcast: int = 0

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("WebSocket client connected. Total clients: %d", len(self.active_connections))
        # Send welcome and connection status
        await self.send_personal_message({
            "type": "CONNECTION_ESTABLISHED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "connected",
            "active_clients": len(self.active_connections),
            "message": "Connected to JAL-RAKSHAK Real-Time Telemetry Stream",
        }, websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info("WebSocket client disconnected. Remaining clients: %d", len(self.active_connections))

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception:
            pass

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcasts real-time event packet to all active WebSocket clients."""
        if not self.active_connections:
            return

        now = datetime.now(timezone.utc).isoformat()
        if "timestamp" not in message:
            message["timestamp"] = now

        self.last_broadcast_timestamp = now
        self.total_messages_broadcast += 1

        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)

        # Cleanup dropped connections
        for dead in dead_connections:
            self.disconnect(dead)

    def get_stats(self) -> Dict[str, Any]:
        return {
            "active_clients": len(self.active_connections),
            "total_messages_broadcast": self.total_messages_broadcast,
            "last_broadcast_timestamp": self.last_broadcast_timestamp,
        }

ws_manager = ConnectionManager()
