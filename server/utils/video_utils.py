import os
import time
from typing import List, Dict
from pydub import AudioSegment
from dependencies.transcribe_and_translate import transcribe_audio, translate_text
from utils.audio_utils import generate_subtitles, extract_audio_from_video
from utils.parsingoutputs import parse_subtitles
from utils.file_handling import clean_temp_files


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
        end_ms = min(start_ms + chunk_duration * 1000, duration_ms)
        chunk = audio[start_ms:end_ms]
        chunk_path = f"{os.path.splitext(audio_path)[0]}_{
            start_ms // 1000}.wav"
        chunk.export(chunk_path, format="wav")
        audio_chunks.append(chunk_path)
        chunk_number += 1
    await socketio.emit("process-state", {
        "stage": "batching",
        "message": "Batching complete",
        "progress": 100,
    })
    return audio_chunks
""" 

"""


async def process_video(
    file_path: str,
    whisper_model,
    fb_model,
    fb_tokenizer,
    selected_languages: List[str],
    action_type: str,
    subtitle_format: str,
    socketio,
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
        Segment Result: {'start_time': 598.0, 'end_time': 600.0, 'text': ' Diese wollen wir jetzt natürlich noch über ein Webinar.', 
        'translations': {'en': 'This is what we want to do through a webinar.'}}
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
            progress = ((idx + 1) / total_chunks) * 100
            await socketio.emit("process-state", {
                "stage": "transcribing",
                "message": f"Transcribing audio part {idx + 1} of {total_chunks}...",
                "progress": progress,
            })
            transcription = transcribe_audio(chunk_path,  whisper_model)
            detected_lang = transcription["language"]
            chunk_offset = idx * 600
            for segment in transcription["segments"]:
                start_time = segment["start"] + chunk_offset  # Add offset
                end_time = segment["end"] + chunk_offset  # Add offset
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
                    for lang_idx, lang in enumerate(selected_languages):
                        total_translations = total_chunks * \
                            len(selected_languages)
                        current_translation = idx * \
                            len(selected_languages) + \
                            lang_idx + 1  # Overall index
                        progress = 50 + (current_translation /
                                         total_translations) * 50  #

                        print(f"Translating from {detected_lang} to {
                            lang}...")  # Debugging
                        translations[lang] = translate_text(
                            text,
                            fb_model,
                            fb_tokenizer,
                            target_lang=lang,
                            src_lang=transcription["language"],
                        )
                        await socketio.emit("process-state", {
                            "stage": "translating",
                            "message": f"Translating from [{detected_lang.upper()}] to [{lang.upper()}] for audio part {idx + 1} of {total_chunks}.",
                            "progress": progress,
                        })
                    segment_result["translations"] = translations
                    """  print(f"Segment Result: {
                        segment_result}")  # Debugging """
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
    subtitles_output = await generate_subtitles(subtitle_format, results, socketio, selected_languages, detected_lang)
    tracking_paths = []
    if subtitles_output:
        print(f"Subtitles saved at {subtitles_output}")
    original_path = subtitles_output.get("original")
    tracking_paths.append(original_path)
    translation_paths = subtitles_output.get("translations", {})
    parsed_subtitles = {
        "original":  parse_subtitles(original_path),
    }
    print(f"Original subtitles parsed successfully: {original_path}")
    if translation_paths:
        for lang, path in translation_paths.items():
            parsed_subtitles[lang] = parse_subtitles(path)
            tracking_paths.append(path)
            print(f"Translation parsed for {lang}: {path}")

    # Clean up temporary files
    clean_temp_files(os.path.dirname(file_path))
    # Return results
    return {
        "message": "Processing completed successfully!",
        "details": {
            "language_detected": detected_lang,
            "segments_processed": len(results),
            "format": subtitle_format,
            "parsed_paths": parsed_subtitles,  # Parsed subtitle data
            "tracking_paths": tracking_paths,      # File paths for tracking
        }
    }
