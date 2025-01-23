import os
from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Depends
from fastapi import Request
from typing import List
import time
import uuid
from utils.audio_utils import create_temp_video_folder
from utils.video_utils import process_video

router = APIRouter(
    prefix="/upload",
    tags=["upload"],
)


@router.post("/")
async def upload_video(
    request: Request,
    file: UploadFile = File(...),
    action_type: str = Form(..., alias="actionType"),
    selected_languages: List[str] = Form(..., alias="selectedLanguages"),
    subtitle_format: str = Form(..., alias="subtitleFormat")

):
    """
    Endpoint to upload video files.
    """
    print(selected_languages)
    try:
        whisper_model = request.app.state.whisper_model
        fb_model = request.app.state.fb_model
        fb_tokenizer = request.app.state.fb_tokenizer
        socketio = request.app.state.socketio
        await socketio.emit("process-state", {
            "stage": "uploading",
            "message": "Starting uploading...",
            "progress": 0,
        })
        if not whisper_model or not fb_model or not fb_tokenizer:
            raise HTTPException(
                status_code=500, detail="Failed to load Whisper and/or Facebook models."
            )
        valid_extensions = {".mp4", ".avi", ".mkv", ".mov"}
        if not file.content_type.startswith("video/") or not os.path.splitext(file.filename)[1].lower() in valid_extensions:
            raise HTTPException(
                status_code=400, detail="Invalid file type. Please upload a video."
            )

        # Ensure the temporary folder exists
        try:
            temp_folder = create_temp_video_folder()
        except OSError as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to create temporary folder: {str(e)}"
            )

        # Generate a secure file path
        file_path = os.path.join(temp_folder, f"{uuid.uuid4().hex}{
                                 os.path.splitext(file.filename)[1]}")

        # Save the file in chunks
        with open(file_path, "wb") as buffer:
            for chunk in iter(lambda: file.file.read(1024 * 1024), b""):  # 1MB chunks
                buffer.write(chunk)
        await socketio.emit("process-state", {
            "stage": "uploading",
            "message": "File uploaded successfully",
            "progress": 95,
        })
        # Process the video and generate transcriptions and subtitles
        result = await process_video(file_path, whisper_model, fb_model,
                                     fb_tokenizer, selected_languages, action_type, subtitle_format, socketio)
        return result
    except HTTPException as e:
        raise e

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        )
