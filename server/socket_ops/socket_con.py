from socketio import AsyncClient
import asyncio
import aiohttp


socketio = AsyncClient(
    reconnection=True, reconnection_attempts=5, reconnection_delay=2)


async def is_socket_server_up(url):
    """Checks if the Socket.IO server is up by sending a ping."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{url}/socket.io/?EIO=4&transport=polling", timeout=5) as response:
                if response.status == 200:
                    return True
                else:
                    return False
    except aiohttp.ClientError as e:
        print(f"HTTP error during server check: {e}")
    except asyncio.TimeoutError:
        print("Server check timed out.")
    except Exception as e:
        print(f"Unexpected error during server check: {e}")
    return False


async def connect_to_socket_server(retry_attempts=3):
    """Centralized Socket.IO connection function."""
    attempts = 0

    while attempts < retry_attempts:
        try:
            # Skip if already connected
            if socketio.connected:
                print("Already connected to the Socket.IO server.")
                return socketio

            # Check if server is up
            if await is_socket_server_up("http://localhost:9001"):
                await socketio.connect("http://localhost:9001")
                print("Connected to Socket.IO server.")

                # Emit registration event
                ack = await socketio.call("register", {"clientType": "fastapi", "id": "fastapi-client"}, timeout=10)
                if ack == "ok":
                    print("Registration successful.")
                    return socketio
                else:
                    print("Registration failed. Retrying...")

        except Exception as e:
            print(f"Connection attempt {
                  attempts + 1}/{retry_attempts} failed: {e}")

        attempts += 1
        await asyncio.sleep(5)

    print("Max retry attempts reached. Could not connect to Socket.IO server.")
    return None
