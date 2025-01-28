from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from DB.database import get_db
from DB.models import SubtitleFiles
from DB.vtt_schema import VTT
from DB.subtitle_operations import upsert_subtitle, fetch_subtitles

router = APIRouter(
    prefix="/subtitles",
    tags=["subtitles"],)


@router.post("/save")
async def save_subtitles(subtitle: VTT, db: Session = Depends(get_db)):
    result = upsert_subtitle(
        db=db,
        video_id=subtitle.video_id,
        language=subtitle.language,
        format=subtitle.format,
        content=subtitle.content,
    )
    return {"message": "Subtitle saved successfully", "subtitle_id": result.id}


@router.get("/get_all/{video_id}/{language}")
async def get_subtitles(video_id: str, language: str, db: Session = Depends(get_db)):
    subtitle = fetch_subtitles(db, video_id, language)
    if not subtitle:
        raise HTTPException(status_code=404, detail="Subtitle not found")
    return {"video_id": video_id, "language": language, "content": subtitle.content}
