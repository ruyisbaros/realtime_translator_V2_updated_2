from fastapi import Request
from socketio import AsyncClient


async def get_socketio_client(request: Request) -> AsyncClient:
    """
    Dependency function to fetch the socketio client from app state.
    """
    socketio = request.app.state.socketio
    if not socketio.connected:
        raise Exception("Socket.IO client is not connected.")
    return socketio
