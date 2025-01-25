# socket_ops/socketio_manager.py
from socketio import AsyncServer, ASGIApp
from fastapi import FastAPI
from socket_ops.client_manager import ClientManager
from utils.audio_utils import save_as_wav, create_temp_audio_folder, create_temp_video_folder
from utils.video_utils import process_video
from dependencies.translations import transcribe_audio, translate_text
import os
import aiohttp
import base64
warning_sent = False


def create_sio_app(sio: AsyncServer) -> ASGIApp:
    """
    Combine the FastAPI app with the Socket.IO server into a single ASGI application.
    """
    return ASGIApp(sio)


def setup_socket_events(sio: AsyncServer, client_manager: ClientManager, app: FastAPI):
    """
    Register global Socket.IO event handlers.
    """
    temp_audio_folder = create_temp_audio_folder()
    client_ids = ["react-client", "node-client"]

    @sio.on("connect")
    async def connect(sid, environ):
        await sio.emit("connection-success", {"message": "Connection established!"}, room=sid)

    @sio.on("register")
    async def handle_register(sid, data):
        client_type = data.get("clientType")
        client_id = data.get("id")

        if not client_id:
            print(f"Registration failed for {sid}: Missing client ID.")
            return
        # use client_manager register function
        client_manager.register_client(sid, client_type, client_id)

    @sio.on("audio-chunk")
    async def handle_audio_chunk(sid, data):
        """
        Handle incoming audio chunks and process them.
        """
        print("Chunk received")
        whisper_model = app.state.whisper_model
        fb_model = app.state.fb_model
        fb_tokenizer = app.state.fb_tokenizer
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
                        client = client_manager.get_client_by_id(
                            "react-client")
                        if client and client.get("socketId"):
                            await sio.emit("language-warning", {"message": warning_message}, room=client.get("socketId"))
                        warning_sent = True  # Set the flag
                    # Emit only transcription
                    for client_id in client_ids:
                        client = client_manager.get_client_by_id(client_id)
                        if client and client.get("socketId"):
                            await sio.emit("transcription", {"type": "transcription", "text": transcribed_text}, room=client.get("socketId"))
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
                    for client_id in client_ids:
                        client = client_manager.get_client_by_id(client_id)
                        if client and client.get("socketId"):
                            await sio.emit("transcription", {"type": "transcription", "text": translated_text}, room=client.get("socketId"))
            else:
                # No translation model available, emit transcription
                for client_id in client_ids:
                    client = client_manager.get_client_by_id(client_id)
                    if client and client.get("socketId"):
                        await sio.emit("transcription", {"type": "transcription", "text": transcribed_text}, room=client.get("socketId"))
        except Exception as e:
            print(f"Error processing audio chunk: {e}")

    @sio.on("start-processing")
    async def handle_start_processing(sid, data):
        """
        Start processing the uploaded video file.
        """
        file_path = data.get("file_path")
        selected_languages = data.get("selectedLanguages")
        action_type = data.get("actionType")
        subtitle_format = data.get("subtitleFormat")
        whisper_model = app.state.whisper_model
        fb_model = app.state.fb_model
        fb_tokenizer = app.state.fb_tokenizer
        if not file_path or not os.path.exists(file_path):
            await sio.emit("process-state", {
                "stage": "error",
                "message": "File not found for processing.",
                "progress": 0,
            })
            return

        try:
            print(f"Starting processing for file: {file_path}")
            await process_video(file_path, whisper_model, fb_model, fb_tokenizer, selected_languages, action_type, subtitle_format, sio)
        except Exception as e:
            await sio.emit("process-state", {
                "stage": "error",
                "message": f"Error during processing: {str(e)}",
                "progress": 0,
            })

    @sio.on("disconnect")
    async def disconnect(sid):
        client_manager.unregister_client(sid)
        print(f"Client disconnected: {sid}")
