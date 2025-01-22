import os
import base64
import wave
from fastapi import FastAPI
from openai import OpenAI
from decouple import config
from socketio import AsyncClient
from asyncio import Lock

socketio = AsyncClient()

# Maintain the state
state_lock = Lock()
current_state = "idle"

# Load OpenAI API Key
OPENAI_API_KEY = config("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

# Temporary folder for audio chunks
TEMP_AUDIO_FOLDER = "temp_audio"
os.makedirs(TEMP_AUDIO_FOLDER, exist_ok=True)


async def handle_state_change(new_state):
    """
    Update the internal state based on new state from the socket server.
    """
    global current_state
    async with state_lock:
        current_state = new_state
        print(f"Updated state to: {current_state}")


async def lifespan(app: FastAPI):
    # Startup logic
    await socketio.connect("http://localhost:9001")
    print("FastAPI connected to Socket.IO server")
    await socketio.emit("register", {"clientType": "fastapi", "id": "fastapi-client"})

    # Listen for state changes
    @socketio.on("state-change")
    async def on_state_change(data):
        new_state = data.get("state", "idle")
        await handle_state_change(new_state)
    yield  # Keeps the app running

    # Shutdown logic
    await socketio.disconnect()
    print("FastAPI disconnected from Socket.IO server")

app = FastAPI(lifespan=lifespan)


def save_audio_chunk(audio_chunk, file_path):
    try:
        with wave.open(file_path, "wb") as wav_file:
            wav_file.setnchannels(2)  # Stereo
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(44100)  # 44.1 kHz sample rate
            wav_file.writeframes(audio_chunk)
        print(f"Saved audio to {file_path}")
    except Exception as e:
        print(f"Error saving audio: {e}")


def transcribe_audio(file_path):
    """
    Transcribe the audio file using OpenAI's Whisper model.
    """
    try:
        with open(file_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="en",
                response_format="text"
            )
        transcription = response if response else "No transcription available"
        return transcription
    except Exception as e:
        print(f"Error during transcription: {e}")
        return "Transcription failed"


@socketio.on("audio-chunk")
async def handle_audio_chunk(data):
    """
    Handle the incoming audio chunk from the Socket.IO server.
    """
    try:
        # Decode the Base64-encoded chunk
        raw_audio = base64.b64decode(data["chunk"])

        # Save the chunk as a WAV file
        temp_file_path = os.path.join(TEMP_AUDIO_FOLDER, "temp_audio.wav")
        save_audio_chunk(raw_audio, temp_file_path)

        # Transcribe the audio
        transcription = transcribe_audio(temp_file_path)
        print(f"Transcription: {transcription}")

        # Emit the transcription back to the Socket.IO server
        await socketio.emit("transcription", {"text": transcription, "type": "transcription"})
    except Exception as e:
        print(f"Error processing audio chunk: {e}")
