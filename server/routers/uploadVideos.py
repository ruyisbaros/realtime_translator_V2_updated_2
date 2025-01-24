import os
from fastapi import APIRouter, UploadFile, File,  HTTPException
import uuid
import asyncio
from utils.audio_utils import create_temp_video_folder

router = APIRouter(
    prefix="/upload",
    tags=["upload"],
)


@router.post("/")
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
