import os
import time
from typing import List, Dict
from pydub import AudioSegment
from dependencies.transcribe_and_translate import transcribe_audio, translate_text
from utils.audio_utils import create_subtitle_folder, extract_audio_from_video


async def batch_audio(socketio, audio_path: str, chunk_duration: int = 600) -> List[str]:
    """
    Split audio into smaller chunks for processing.

    Args:
        audio_path (str): Path to the input audio file.
        chunk_duration (int): Duration of each audio chunk in seconds.

    Returns:
        List[str]: List of paths to the audio chunks.
    """

    audio = AudioSegment.from_wav(audio_path)
    duration_ms = len(audio)
    audio_chunks = []
    chunk_number = 0
    total_chunks = (duration_ms + (chunk_duration * 1000 - 1)
                    ) // (chunk_duration * 1000)
    for start_ms in range(0, duration_ms, chunk_duration * 1000):
        progress = ((chunk_number + 1) / total_chunks) * 100
        await socketio.emit("process-state", {
            "stage": "batching",
            "message": f"Creating audio chunk {chunk_number + 1} of {total_chunks}.",
            "progress": progress,
        })
        end_ms = min(start_ms + chunk_duration * 1000, duration_ms)
        chunk = audio[start_ms:end_ms]
        chunk_path = f"{os.path.splitext(audio_path)[0]}_{
            start_ms // 1000}.wav"
        chunk.export(chunk_path, format="wav")
        audio_chunks.append(chunk_path)
        chunk_number += 1

    return audio_chunks


async def process_video(
    file_path: str,
    whisper_model,
    fb_model,
    fb_tokenizer,
    selected_languages: List[str],
    action_type: str,
    subtitle_format: str,
    socketio

) -> List[Dict]:
    """
    Process the video: extract audio, transcribe, and translate if needed.

    Args:
        file_path (str): Path to the uploaded video file.
        whisper_model: Preloaded Whisper model instance.
        fb_model: Preloaded Facebook translation model instance.
        fb_tokenizer: Preloaded Facebook tokenizer.
        selected_languages (List[str]): Target languages for translation.
        action_type (str): "transcribe" or "translate".
        subtitle_format (str): Desired subtitle format ("VTT" or "SRT").

    Returns:
        List[Dict]: Transcription and translation results with timestamps.
    """
    results = []
    detected_lang = None
    # Step 1: Extract audio
    temp_audio_path = os.path.splitext(file_path)[0] + ".wav"
    await extract_audio_from_video(file_path, temp_audio_path, socketio)

    # Step 2: Batch processing for long audio
    audio_chunks = await batch_audio(socketio, temp_audio_path)
    total_chunks = len(audio_chunks)
    # Notify initial progress
    await socketio.emit("process-state", {
        "stage": "transcribing",
        "message": "Starting transcription...",
        "progress": 0,
    })
    # Step 3: Transcription and Translation
    for idx, chunk_path in enumerate(audio_chunks):

        try:
            progress = ((idx + 1) / total_chunks) * \
                100  # First 50% of progress
            await socketio.emit("process-state", {
                "stage": "transcribing",
                "message": f"Transcribing audio part {idx + 1} of {total_chunks}...",
                "progress": progress,
            })
            transcription = transcribe_audio(chunk_path,  whisper_model)
            detected_lang = transcription["language"]
            for segment in transcription["segments"]:
                start_time = segment["start"]
                end_time = segment["end"]
                text = segment["text"]

                # Prepare segment result
                segment_result = {
                    "start_time": start_time,
                    "end_time": end_time,
                    "text": text,
                }

                # Translate if required
                if action_type == "translation" and selected_languages:
                    translations = {}
                    for lang in selected_languages:
                        progress = 50 + ((idx + 1) / total_chunks) * \
                            50 / len(selected_languages)
                        await socketio.emit("process-state", {
                            "stage": "translating",
                            "message": f"Translating from {detected_lang} to {lang.upper()} for audio part {idx + 1} of {total_chunks}.",
                            "progress": progress,
                        })
                        print(f"Translating from {detected_lang} to {
                            lang}...")  # Debugging
                        translations[lang] = translate_text(
                            text,
                            fb_model,
                            fb_tokenizer,
                            target_lang=lang,
                            src_lang=transcription["language"],
                        )
                    segment_result["translations"] = translations
                # Append result
                results.append(segment_result)
        except Exception as e:
            # Notify error for the current chunk
            await socketio.emit("process-state", {
                "stage": "transcribing",
                "message": f"Error processing chunk {idx + 1}: {str(e)}",
                "progress": ((idx + 1) / total_chunks) * 100,
            })
            continue
    subtitle_folder = create_subtitle_folder()
    # Step 4: Generate subtitles
    if subtitle_format == "srt":
        await socketio.emit("process-state", {
            "stage": "finalizing",
            "message": "Creating subtitles in SRT format. Almost there...",
            "progress": 95,
        })
        output_path = os.path.join(subtitle_folder, "output.srt")
        generate_srt(results, output_path)
        await socketio.emit("process-state", {
            "stage": "finalizing",
            "message": "Subtitle creation complete!",
            "progress": 100,
        })
    elif subtitle_format == "vtt":
        await socketio.emit("process-state", {
            "stage": "finalizing",
            "message": "Creating subtitles in SRT format. Almost there...",
            "progress": 95,
        })
        output_path = os.path.join(subtitle_folder, "output.vtt")
        generate_vtt(results, output_path)
        await socketio.emit("process-state", {
            "stage": "finalizing",
            "message": "Subtitle creation complete!",
            "progress": 100,
        })

    return {
        "message": "Processing completed successfully!",
        "output_file": output_path,
        "details": {
            "language_detected": detected_lang,
            "segments_processed": len(results),
            "format": subtitle_format,
        }
    }


def generate_srt(subtitle_segments, output_path):
    """
    Generate an SRT file from subtitle segments.
    """
    srt_content = ""
    for idx, segment in enumerate(subtitle_segments, start=1):
        # Ensure start_time and end_time are converted to formatted strings
        start_time = f"{segment['start_time']:.3f}".replace(".", ",")
        end_time = f"{segment['end_time']:.3f}".replace(".", ",")

        # Add main text
        text = segment.get("text", "")
        srt_content += f"{idx}\n{start_time} --> {end_time}\n{text}\n\n"

        # Add translations if they exist
        if "translations" in segment:
            for lang, translation in segment["translations"].items():
                srt_content += f"[{lang.upper()}] {translation}\n"

    # Write the SRT content to the specified file
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(srt_content)


def generate_vtt(subtitle_segments, output_path):
    """
    Generate a VTT file from subtitle segments.
    """
    vtt_content = "WEBVTT\n\n"
    for segment in subtitle_segments:
        start_time = segment["start_time"]
        end_time = segment["end_time"]
        text = segment["text"]

        vtt_content += f"{start_time} --> {end_time}\n{text}\n\n"

        # Add translations if they exist
        if "translations" in segment:
            for lang, translation in segment["translations"].items():
                vtt_content += f"[{lang.upper()}] {translation}\n"

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(vtt_content)
