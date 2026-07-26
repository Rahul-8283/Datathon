"""WebSocket endpoint and ConnectionManager for real-time intelligence alerts."""

import asyncio
import json
import logging
from typing import List, Dict, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSocket Real-Time Alerts"])

class ConnectionManager:
    """Manages active WebSocket client connections and broadcasts live alerts."""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total active connections: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        json_msg = json.dumps(message)
        for connection in list(self.active_connections):
            try:
                await connection.send_text(json_msg)
            except Exception as e:
                logger.warning(f"Error broadcasting to WebSocket client: {e}")
                self.disconnect(connection)

manager = ConnectionManager()

@router.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint broadcasting real-time operational alerts, network changes, and anomaly spikes.
    """
    await manager.connect(websocket)
    try:
        # Send initial welcome / handshake payload
        welcome = {
            "type": "INITIAL_HANDSHAKE",
            "message": "Connected to Karnataka Police Real-Time Intelligence Alert Stream",
            "status": "ONLINE",
            "timestamp": asyncio.get_event_loop().time()
        }
        await websocket.send_text(json.dumps(welcome))
        
        # Keep connection open and listen for heartbeat / incoming client messages
        while True:
            data = await websocket.receive_text()
            # Respond to ping heartbeats
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "PONG", "timestamp": asyncio.get_event_loop().time()}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket unexpected error: {e}")
        manager.disconnect(websocket)
