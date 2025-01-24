from socketio import AsyncServer, ASGIApp
from fastapi import FastAPI

# Step 1: Initialize the Socket.IO server
sio = AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# Step 2: Define the ASGI app combining FastAPI and Socket.IO


def create_sio_app(app: FastAPI) -> ASGIApp:
    """
    Combine the FastAPI app with the Socket.IO server into a single ASGI application.
    """
    return ASGIApp(sio, other_asgi_app=app)


# Step 3: Function to register global Socket.IO events
clients = {}


def setup_socket_events():
    """
    Register global Socket.IO event handlers.
    """
    @sio.on("connect")
    async def connect(sid, environ):
        print(f"Client connected: {sid}")
        await sio.emit("connection-success", {"message": "Connection established!"}, room=sid)

    @sio.on("register")
    async def handle_register(sid, data):
        """
        Register a new client or update an existing one.
        """
        client_type = data.get("clientType")
        client_id = data.get("id")

        if not client_id:
            print(f"Registration failed for {sid}: Missing client ID.")
            return

        if client_id in clients:
            # Update existing client's session
            clients[client_id]["socketId"] = sid
            print(f"Client reconnected: {clients[client_id]}")
        else:
            # Add new client
            clients[client_id] = {"socketId": sid, "clientType": client_type}
            print(f"New client registered: {clients[client_id]}")

        # Emit acknowledgment back to the client
        await sio.emit("register_ack", {"status": "registered"}, room=sid)

    @sio.on("disconnect")
    async def disconnect(sid):
        print(f"Client disconnected: {sid}")
