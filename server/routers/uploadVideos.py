import os
from fastapi import APIRouter, UploadFile, File,  HTTPException, Body
from typing import List, Dict
import uuid
import asyncio
from pydantic import BaseModel
from utils.audio_utils import create_temp_video_folder
from utils.parsingOutputs import parse_vtt_for_ai, convert_to_ai_format, save_new_vtt
from utils.chains import generate_structured_timestamps_ai


class VTTPath(BaseModel):
    vtt_path: str  # Expect a single path as a string


router = APIRouter(
    prefix="/upload",
    tags=["upload"],
)


@router.post("/upload_video")
async def upload_video(file: UploadFile = File(...)):
    """
    Endpoint to upload video files.
    """

    try:
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

        return {
            "message": "File uploaded successfully.",
            "file_path": file_path,

        }
    except HTTPException as e:
        raise e

    except Exception as e:
        print(f"Unexpected error during file upload: {
              str(e)}")  # Debugging log
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        )
    finally:
        file.file.close()


@router.post("/create-timestamps")
async def create_timestamps(vtt_path: dict = Body(...)):
    """
    Create timestamps for the provided VTT file.
    """
    vtt_path = vtt_path.get("vtt_path")  # Extract the string
    if not vtt_path or not isinstance(vtt_path, str):
        raise HTTPException(
            status_code=400, detail="Invalid VTT path provided.")

    print(f"Processing VTT file: {vtt_path}")

    # Read VTT file
    try:
        with open(vtt_path, "r", encoding="utf-8") as f:
            vtt_content = f.read()
    except Exception as e:
        print(f"Error reading VTT file: {e}")
        return {"message": "Error reading VTT file", "files": []}

    # Extract timestamped text
    timestamp_data = parse_vtt_for_ai(vtt_content)

    # Convert to AI-compatible format (plain text)
    ai_input = convert_to_ai_format(timestamp_data)

    # Send to LLaMA (or another AI model) for timestamp generation
    new_timestamps = await generate_structured_timestamps_ai(ai_input)

    # Convert AI output back to usable format
    new_vtt_file_path = vtt_path.replace(".vtt", "-timestamps.vtt")
    save_new_vtt(new_timestamps, new_vtt_file_path)
    return {"message": "Timestamps generated", "file_path": new_vtt_file_path}
