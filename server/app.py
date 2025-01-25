from fastapi import FastAPI
from dependencies.model_loaders import load_whisper_model, load_facebook_m2m100_local
# from socket_ops.socket_events import shutdown_processes
from socket_ops.socketio_manager import create_sio_app, setup_socket_events
from fastapi.middleware.cors import CORSMiddleware
from socketio import AsyncServer
from contextlib import asynccontextmanager
from socket_ops.client_manager import ClientManager
from routers import uploadVideos

client_manager = ClientManager()
sio = AsyncServer(async_mode="asgi", cors_allowed_origins="*",  ping_timeout=6000,
                  ping_interval=3000)
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
        app.state.whisper_model = whisper_model
        # Load Facebook model and tokenizer for translation
        fb_config = local_models.get("facebook-medium")  # Default to medium
        fb_model, fb_tokenizer = load_facebook_m2m100_local(fb_config["name"])
        app.state.fb_model = fb_model
        app.state.fb_tokenizer = fb_tokenizer
        print("Both Whisper and Facebook models loaded successfully.")

    except Exception as e:
        print(f"Error during startup: {e}")
        raise e  # Ensure the application fails fast if critical setup fails

    yield  # Keeps the application running

    try:
        # await shutdown_processes(temp_audio_folder)
        print("Application shutdown complete.")
    except Exception as e:
        print(f"Error during shutdown: {e}")


# Pass the lifespan to the FastAPI app
app = FastAPI(lifespan=lifespan)


app.include_router(uploadVideos.router)
setup_socket_events(sio, client_manager, app)
sio_asgi_app = create_sio_app(sio)
app.mount("/", sio_asgi_app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
