import wave
import os
import subprocess
import datetime


def save_as_wav(audio_data, file_path):
    """
    Save raw PCM audio data as a WAV file.
    """
    with wave.open(file_path, "wb") as wav_file:
        wav_file.setnchannels(2)  # Stereo
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(44100)  # 44.1 kHz sample rate
        wav_file.writeframes(audio_data)


def create_temp_audio_folder():
    """
    Ensure the temp_audio folder exists in the project's root directory.
    """
    # Get the directory of the current script
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # Define the path for the temp_audio folder in the root
    temp_folder = os.path.join(base_dir, "../temp_audio")
    os.makedirs(temp_folder, exist_ok=True)
    return temp_folder


def create_temp_video_folder():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    temp_folder = os.path.normpath(os.path.join(base_dir, "../temp_video"))
    os.makedirs(temp_folder, exist_ok=True)
    return temp_folder


def delete_file(filepath):
    try:
        os.remove(filepath)
        print(f"File {filepath} removed successfully.")
    except FileNotFoundError:
        print(f"File {filepath} not found.")
    except Exception as e:
        print(f"Error deleting file {filepath}: {e}")


def create_subtitle_folder():
    """
    Ensure the 'subtitles' folder exists in the project's temp directory.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    subtitle_folder = os.path.normpath(
        os.path.join(base_dir, "../temp_video/subtitles"))
    print(f"Resolved subtitle folder: {subtitle_folder}")
    os.makedirs(subtitle_folder, exist_ok=True)
    return subtitle_folder


async def generate_subtitles(subtitle_format, results, socketio, selected_languages, detected_lang):
    """
    Generate subtitles in the specified format and notify the client.
    """
    subtitle_folder = create_subtitle_folder()

    try:
        # Step 4: Generate subtitles
        if subtitle_format == "srt":
            await socketio.emit("process-state", {
                "stage": "finalizing",
                "message": "Creating subtitles in SRT format. Almost there...",
                "progress": 95,
            })

            paths = generate_srt(results, subtitle_folder,
                                 selected_languages, detected_lang)

        elif subtitle_format == "vtt":
            await socketio.emit("process-state", {
                "stage": "finalizing",
                "message": "Creating subtitles in VTT format. Almost there...",
                "progress": 95,
            })

            paths = generate_vtt(results, subtitle_folder,
                                 selected_languages, detected_lang)

        else:
            raise ValueError(f"Unsupported subtitle format: {subtitle_format}")

        await socketio.emit("process-state", {
            "stage": "finalizing",
            "message": "Subtitle creation complete!",
            "progress": 100,
            "output_path": subtitle_folder,
        })

    except Exception as e:
        print(f"Error generating subtitles: {e}")
        await socketio.emit("process-state", {
            "stage": "error",
            "message": f"Failed to generate subtitles: {str(e)}",
            "progress": 0,
        })

    return paths


async def extract_audio_from_video(video_path: str, output_audio_path: str, socketio) -> None:
    """
    Extract audio from the video using FFmpeg.
    """
    command = [
        "ffmpeg",
        "-i", video_path,
        "-vn",  # No video
        "-ac", "2",  # Stereo audio
        "-ar", "44100",  # 44.1 kHz sample rate
        "-f", "wav",  # WAV format
        output_audio_path
    ]
    try:
        subprocess.run(command, check=True,
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        await socketio.emit("process-state", {
            "stage": "extracting",
            "message": "Extracting complete",
            "progress": 100,
        })
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"FFmpeg error: {e.stderr.decode('utf-8')}")


def format_time(seconds):
    """
    Convert time in seconds to SRT timestamp format (HH:MM:SS,mmm).
    """
    hours = int(seconds // 3600)  # Calculate total hours
    minutes = int((seconds % 3600) // 60)  # Calculate remaining minutes
    secs = int(seconds % 60)  # Calculate remaining seconds
    milliseconds = int((seconds - int(seconds)) * 1000)  # Milliseconds part

    return f"{hours:02}:{minutes:02}:{secs:02},{milliseconds:03}"


def generate_srt(subtitle_segments, output_folder, selected_languages, detected_lang):
    """
    Generate SRT files for original transcription and translations.

    Parameters:
        subtitle_segments (list): List of subtitle segments containing start_time, end_time, text, and translations.
        output_folder (str): Directory where the SRT files will be saved.
        selected_languages (list): List of languages to generate translations for.
        detected_lang (str): Language code for the original transcription.
    Returns:
        dict: Paths of the generated SRT files (original and translations).
    """
    # Ensure the output folder exists
    os.makedirs(output_folder, exist_ok=True)

    # Generate SRT for original transcription
    original_srt_content = ""
    for idx, segment in enumerate(subtitle_segments, start=1):
        start_time = format_time(segment['start_time'])
        end_time = format_time(segment['end_time'])
        text = segment.get("text", "")

        original_srt_content += f"{idx}\n{
            start_time} --> {end_time}\n{text}\n\n"

    original_srt_path = os.path.normpath(os.path.join(
        output_folder, f"subtitles-original.srt"))
    with open(original_srt_path, "w", encoding="utf-8") as f:
        f.write(original_srt_content)

    # Generate SRTs for translations
    # Generate SRTs for translations
    translation_paths = {}
    if selected_languages:
        for lang_code in selected_languages:
            print(f"Processing translations for language: {lang_code}")
            translation_srt_content = ""
            for idx, segment in enumerate(subtitle_segments, start=1):
                print(f"Segment {idx} translations: {
                      segment.get('translations', {})}")
                start_time = format_time(segment['start_time'])
                end_time = format_time(segment['end_time'])
                translated_text = segment.get("translations", {}).get(lang_code.upper(), "") or \
                    segment.get("translations", {}).get(lang_code.lower(), "")
                if translated_text:
                    translation_srt_content += f"{idx}\n{
                        start_time} --> {end_time}\n{translated_text}\n\n"

            if translation_srt_content.strip():
                translation_srt_path = os.path.normpath(
                    os.path.join(output_folder, f"subtitles-{lang_code}.srt"))
                with open(translation_srt_path, "w", encoding="utf-8") as f:
                    f.write(translation_srt_content)
                translation_paths[lang_code] = translation_srt_path
            else:
                print(f"No translations available for {
                      lang_code}. Skipping file generation.")

    return {
        "original": original_srt_path,
        "translations": translation_paths
    }


def format_time_vtt(seconds):
    """
    Format time in seconds to WebVTT timestamp format (HH:MM:SS.mmm).
    """
    whole_seconds = int(seconds)
    milliseconds = int((seconds - whole_seconds) * 1000)
    hours, rem = divmod(whole_seconds, 3600)
    minutes, seconds = divmod(rem, 60)

    return f"{hours:02}:{minutes:02}:{seconds:02}.{milliseconds:03}"


def generate_vtt(subtitle_segments, output_path, selected_languages, detected_lang):
    """
    Generate VTT files for original transcription and selected translations.
    """
    # Generate original transcription VTT
    original_vtt_content = "WEBVTT\n\n"
    for segment in subtitle_segments:
        # Format start and end times
        start_time = format_time_vtt(segment['start_time'])
        end_time = format_time_vtt(segment['end_time'])

        # Original transcription
        original_text = segment.get("text", "")
        original_vtt_content += f"{start_time} --> {
            end_time}\n {original_text}\n\n"

    # Save original transcription VTT
    original_vtt_path = os.path.normpath(os.path.join(
        output_path, f"subtitles-original.vtt"))
    with open(original_vtt_path, "w", encoding="utf-8") as f:
        f.write(original_vtt_content)

    # Generate VTT for each selected translation
    translation_paths = {}
    if selected_languages:
        for language_code in selected_languages:
            translation_vtt_content = "WEBVTT\n\n"
            for segment in subtitle_segments:
                # Format start and end times
                start_time = format_time_vtt(segment['start_time'])
                end_time = format_time_vtt(segment['end_time'])

                # Translation
                translated_text = segment.get("translations", {}).get(language_code.upper(), "") or \
                    segment.get("translations", {}).get(
                        language_code.lower(), "")
                if not translated_text:  # Skip if no translation is available
                    continue
                translation_vtt_content += f"{start_time} --> {
                    end_time}\n{translated_text}\n\n"

            # Save translation VTT
            translation_vtt_path = os.path.normpath(os.path.join(
                output_path, f"subtitles-{language_code}.vtt"))
            with open(translation_vtt_path, "w", encoding="utf-8") as f:
                f.write(translation_vtt_content)
            translation_paths[language_code] = translation_vtt_path
            print(f"Generated VTT for {language_code}: {translation_vtt_path}")
    else:
        print(f"No translations available for {language_code}, skipping.")

    return {
        "original": original_vtt_path,
        "translations": translation_paths,
    }
