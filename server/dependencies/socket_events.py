from socketio import AsyncClient
from utils.audio_utils import save_as_wav, create_temp_audio_folder
from dependencies.translations import transcribe_audio, translate_text
# from dependencies.state_manager import StateManager
import base64
import asyncio
import os
import aiohttp
import shutil

socketio = AsyncClient(
    reconnection=True, reconnection_attempts=5, reconnection_delay=2)

warning_sent = False  # Global flag to track warning


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


async def setup_socket_events(whisper_model, fb_model=None, fb_tokenizer=None):
    """
    Setup Socket.IO events and connect to the server.

    Args:
        app: FastAPI app instance.
        whisper_model: Loaded Whisper model.
        state_lock: Lock for managing application state.
        fb_model: Loaded Facebook model (optional).
        fb_tokenizer: Tokenizer for Facebook model (optional).
    """
    temp_audio_folder = create_temp_audio_folder()

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

        except Exception as e:
            print(f"Connection failed: {e}. Retrying in 5 seconds...")
            await asyncio.sleep(5)

    await connect_to_socket_server()

    @socketio.on("audio-chunk")
    async def handle_audio_chunk(data):
        """
        Handle incoming audio chunks and process them.
        """
        print("Chunk received")
        # current_state = await state_manager.get_state()

        global warning_sent
        try:
            # Decode the audio chunk
            audio_data = base64.b64decode(data["chunk"])
            temp_wav_path = os.path.join(temp_audio_folder, "temp_chunk.wav")
            save_as_wav(audio_data, temp_wav_path)

            # Transcribe the audio
            transcription_result = transcribe_audio(
                whisper_model, temp_wav_path, src_lang=data["source_language"]
            )
            transcribed_text = transcription_result["text"]
            src_lang = data["source_language"]
            target_lang = data["target_language"]
            print("Transcription: ", transcribed_text)
            # Check if translation is needed
            if fb_model:
                if src_lang == target_lang:
                    print(src_lang, target_lang)
                    # Send warning only once
                    if not warning_sent:
                        warning_message = "Source and target languages are the same. Showing transcription only."
                        print("same source and target languages")
                        await socketio.emit("language-warning", {"message": warning_message})
                        warning_sent = True  # Set the flag
                    # Emit only transcription
                    await socketio.emit("transcription", {"type": "transcription", "text": transcribed_text})
                else:
                    # Reset warning flag if languages differ
                    warning_sent = False
                    # Translate and emit the translated text
                    translated_text = translate_text(
                        fb_model,
                        fb_tokenizer,
                        transcribed_text,
                        src_lang=src_lang,
                        target_lang=target_lang,
                        device=fb_model.device,
                    )
                    print("Translated text", translated_text)
                    await socketio.emit("transcription", {"type": "transcription", "text": translated_text})
            else:
                # No translation model available, emit transcription
                await socketio.emit("transcription", {"type": "transcription", "text": transcribed_text})
        except Exception as e:
            print(f"Error processing audio chunk: {e}")
         # Attempt reconnection on disconnect

    @socketio.on("disconnect")
    async def on_disconnect():
        print("Disconnected from Socket.IO server. Attempting to reconnect...")
        await asyncio.sleep(5)
        await connect_to_socket_server()

    return temp_audio_folder


async def shutdown_socket():
    """
    Disconnect from Socket.IO server during shutdown.
    """
    try:
        if socketio.connected:
            await socketio.disconnect()
            print("Disconnected from Socket.IO server.")
    except Exception as e:
        print(f"Error disconnecting from Socket.IO server: {e}")


async def shutdown_processes(temp_audio_folder):
    """
    Gracefully stop all processes and clean up resources.

    Args:
        temp_audio_folder (str): Path to the temporary audio folder.
        state_manager (StateManager): Instance of the StateManager to manage application state.
    """
    try:

        # Disconnect from Socket.IO
        print("Disconnecting from Socket.IO server...")
        await shutdown_socket()

        # Clean up temporary files
        print("Cleaning up temporary audio files...")
        if os.path.exists(temp_audio_folder):
            for file in os.listdir(temp_audio_folder):
                file_path = os.path.join(temp_audio_folder, file)
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Failed to remove file '{file_path}': {e}")
            print(f"Temporary folder '{
                  temp_audio_folder}' cleaned successfully.")

        print("Shutdown process complete.")
    except Exception as e:
        print(f"Error during shutdown: {e}")
