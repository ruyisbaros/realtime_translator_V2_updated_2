from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import text
from DB.models import SubtitleFiles
from utils.audio_utils import format_time_srt, format_time_vtt
from utils.parsingoutputs import format_time_to_ms


def fetch_subtitles(db: Session, video_id: str, language: str):
    return db.query(SubtitleFiles).filter_by(video_id=video_id, language=language).first()


def upsert_subtitle(db: Session, video_id: str, language: str, format: str, content: str):
    subtitle = db.query(SubtitleFiles).filter_by(
        video_id=video_id, language=language).first()
    if subtitle:
        subtitle.content = content
        subtitle.format = format
        subtitle.updated_at = text("now()")
    else:
        subtitle = SubtitleFiles(
            video_id=video_id,
            language=language,
            format=format,
            content=content,
        )
        db.add(subtitle)
    db.commit()
    return subtitle


def json_to_vtt(json_content):
    vtt_content = "WEBVTT\n\n"
    for entry in json_content:
        start_time = format_time_vtt(entry["start_time"])
        end_time = format_time_vtt(entry["end_time"])
        text = entry["text"]
        vtt_content += f"{start_time} --> {end_time}\n{text}\n\n"
    return vtt_content


def json_to_srt(json_content):
    srt_content = ""
    for idx, entry in enumerate(json_content, start=1):
        start_time = format_time_srt(entry["start_time"])
        end_time = format_time_srt(entry["end_time"])
        text = entry["text"]
        srt_content += f"{idx}\n{start_time} --> {end_time}\n{text}\n\n"
    return srt_content


def vtt_to_json(vtt_content):
    json_content = []
    lines = vtt_content.splitlines()
    for i in range(0, len(lines), 3):  # Assuming 3-line blocks
        time_block = lines[i]
        text = lines[i + 1]
        start_time, end_time = time_block.split(" --> ")
        json_content.append({
            "start_time": format_time_to_ms(start_time),
            "end_time": format_time_to_ms(end_time),
            "text": text,
        })
    return json_content
