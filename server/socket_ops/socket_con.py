from socketio import AsyncClient
import asyncio
import aiohttp


socketio = AsyncClient(
    reconnection=True, reconnection_attempts=5, reconnection_delay=2)


async def is_socket_server_up(url):
    """Checks if the Socket.IO server is up by sending a ping."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{url}/socket.io/?EIO=4&transport=polling") as response:
                if response.status == 200:
                    return True
                else:
                    return False
    except Exception:
        return False


async def connect_to_socket_server():
    try:
        if socketio.connected:
            print("Already connected. Disconnecting first...")
            await socketio.disconnect()  # Close existing connection
            await asyncio.sleep(1)
        if await is_socket_server_up("http://localhost:9001"):
            await socketio.connect("http://localhost:9001")
            print("FastAPI connected to Socket.IO server")
            await asyncio.sleep(5)
            await socketio.emit("register", {"clientType": "fastapi", "id": "fastapi-client"})
            print("Connected to Socket.IO server.")
        return socketio
    except Exception as e:
        print(f"Connection failed: {e}. Retrying in 5 seconds...")
        await asyncio.sleep(5)
