from fastapi import FastAPI
from dependencies.model_loaders import load_whisper_model, load_facebook_m2m100_local
from socket_ops.socket_events import setup_socket_events_of_translator, shutdown_socket, shutdown_processes, setup_socket_events_of_subtitle_creator
from socket_ops.socket_con import connect_to_socket_server
from fastapi.middleware.cors import CORSMiddleware
from socketio import AsyncClient
from contextlib import asynccontextmanager
from routers import uploadVideos

# Initialize FastAPI app
app = FastAPI()
origins = [

    "https://localhost:5123"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
# CORSMiddleware


# state_manager = StateManager()
whisper_model = None  # Whisper model instance
fb_model = None  # Facebook model instance
fb_tokenizer = None  # Facebook tokenizer instance


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan for FastAPI to manage startup and shutdown events.
    """
    global whisper_model, fb_model, fb_tokenizer

    # Model configurations
    local_models = {
        "whisper-medium": {
            "name": "medium",
            "local_model_path": "/home/ahmet/.cache/whisper",
        },
        "facebook-medium": {
            "name": "facebook/m2m100_418M",
            "local_model_path": "/home/ahmet/.cache/huggingface/hub/models--facebook--m2m100_418M",
        },
        "facebook-large": {
            "name": "facebook/m2m100_1.2B",
            "local_model_path": "/home/ahmet/.cache/huggingface/hub/models--facebook--m2m100_1.2B",
        },
    }

    try:
        # Load Whisper model
        whisper_config = local_models.get(
            "whisper-medium")  # Default to medium
        whisper_model = load_whisper_model(whisper_config)

        # Load Facebook model and tokenizer for translation
        fb_config = local_models.get("facebook-medium")  # Default to medium
        fb_model, fb_tokenizer = load_facebook_m2m100_local(fb_config["name"])

        print("Both Whisper and Facebook models loaded successfully.")
        socketio = await connect_to_socket_server()
        app.state.socketio = socketio
        if not app.state.socketio:
            print("Socket.IO initialization failed.")
            return
        # Setup Socket.IO events
        temp_audio_folder = await setup_socket_events_of_translator(socketio, whisper_model, fb_model, fb_tokenizer)
        await setup_socket_events_of_subtitle_creator(socketio, whisper_model, fb_model, fb_tokenizer)
        print("Socket.IO events set up successfully.")

    except Exception as e:
        print(f"Error during startup: {e}")
        raise e  # Ensure the application fails fast if critical setup fails

    yield  # Keeps the application running

    try:
        # Shutdown logic
        # await shutdown_socket(socketio)
        # print("Socket.IO connection closed.")

        await shutdown_processes(temp_audio_folder)
        print("Application shutdown complete.")
    except Exception as e:
        print(f"Error during shutdown: {e}")


# Pass the lifespan to the FastAPI app
app = FastAPI(lifespan=lifespan)


app.include_router(uploadVideos.router)
