import os
import base64
import wave
from fastapi import FastAPI
from openai import OpenAI
from decouple import config
from socketio import AsyncClient
from asyncio import Lock, create_task
import torch
import whisper

app = FastAPI()

socketio = AsyncClient()

# Load model (from cache or download if not present)
model = whisper.load_model("large-v2")
print(torch.cuda.is_available())
# Move model to GPU if available
if torch.cuda.is_available():
    model = model.to("cuda")

# Maintain the state
state_lock = Lock()
current_state = "idle"  # "idle", "paused", "resumed", "stopped", "running"

# Processing lock
processing_lock = Lock()
is_processing = False


# OpenAI Whisper setup
OPENAI_API_KEY = config("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

# Temporary folder for audio chunks
TEMP_AUDIO_FOLDER = "temp_audio"
os.makedirs(TEMP_AUDIO_FOLDER, exist_ok=True)


def save_as_wav(audio_data, file_path):
    """
    Save raw PCM audio data as a WAV file.
    """
    with wave.open(file_path, "wb") as wav_file:
        wav_file.setnchannels(2)  # Stereo
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(44100)  # 44.1 kHz sample rate
        wav_file.writeframes(audio_data)


async def process_audio_chunk(audio_data):
    """
    Process incoming audio chunk and return transcription if applicable.
    """
    try:
        # Save audio to a temporary file
        temp_wav_path = os.path.join(TEMP_AUDIO_FOLDER, "temp_chunk.wav")
        save_as_wav(audio_data, temp_wav_path)

        # Transcribe the audio using OpenAI Whisper
        result = model.transcribe(temp_wav_path, language="en")
        return result["text"]

    except Exception as e:
        print("Error during transcription:", e)
        return None


async def process_audio_data(audio_data):
    global is_processing
    async with processing_lock:
        if is_processing:
            return
        is_processing = True
        try:
            # Process the audio chunk
            transcription = await process_audio_chunk(audio_data)

            # Emit transcription result if available
            if transcription:
                print(transcription)
                await socketio.emit(
                    "transcription", {
                        "type": "transcription", "text": transcription}
                )
        finally:
            is_processing = False


async def handle_state_change(new_state):
    """
    Update the internal state based on new state from the socket server.
    """
    global current_state, is_processing
    async with state_lock:
        current_state = new_state
        print(f"Updated state to: {current_state}")

        if new_state == "paused" or "stopped":
            is_processing = False  # Reset processing state


async def lifespan(app: FastAPI):
    # Startup logic
    await socketio.connect("http://localhost:9001")
    print("FastAPI connected to Socket.IO server")
    await socketio.emit("register", {"clientType": "fastapi", "id": "fastapi-client"})

    @socketio.on("state-change")
    async def on_state_change(data):
        print("New state received from socket server as: ", data)
        new_state = data.get("state", "idle")
        await handle_state_change(new_state)
    yield  # Keeps the app running

    # Shutdown logic
    await socketio.disconnect()
    print("FastAPI disconnected from Socket.IO server")


app = FastAPI(lifespan=lifespan)


@socketio.on("audio-chunk")
async def handle_audio_chunk(data):
    """
    Handle incoming audio chunks from the socket server.
    """
    global current_state

    try:
        # Decode the Base64-encoded chunk
        audio_data = base64.b64decode(data["chunk"])

        # Check the current state before processing
        async with state_lock:
            if current_state not in ["running", "resumed"]:
                print(f"Skipping audio chunk, current state is: {
                      current_state}")
                return

        # Process the audio chunk
        create_task(process_audio_data(audio_data))

    except Exception as e:
        print("Error in handling audio chunk:", e)
