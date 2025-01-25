import wave
import os
import subprocess


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
    temp_folder = os.path.join(base_dir, "../temp_video")
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
    subtitle_folder = os.path.join(base_dir, "../temp_video/subtitles")
    os.makedirs(subtitle_folder, exist_ok=True)
    return subtitle_folder


async def generate_subtitles(subtitle_format, results, socketio):
    """
    Generate subtitles in the specified format and notify the client.
    """
    subtitle_folder = create_subtitle_folder()
    output_path = None  # Initialize to ensure it exists

    try:
        # Step 4: Generate subtitles
        if subtitle_format == "srt":
            await socketio.emit("process-state", {
                "stage": "finalizing",
                "message": "Creating subtitles in SRT format. Almost there...",
                "progress": 95,
            })
            output_path = os.path.join(subtitle_folder, "output.srt")
            generate_srt(results, output_path)

        elif subtitle_format == "vtt":
            await socketio.emit("process-state", {
                "stage": "finalizing",
                "message": "Creating subtitles in VTT format. Almost there...",
                "progress": 95,
            })
            output_path = os.path.join(subtitle_folder, "output.vtt")
            generate_vtt(results, output_path)

        else:
            raise ValueError(f"Unsupported subtitle format: {subtitle_format}")

        await socketio.emit("process-state", {
            "stage": "finalizing",
            "message": "Subtitle creation complete!",
            "progress": 100,
            "output_path": output_path,
        })

    except Exception as e:
        print(f"Error generating subtitles: {e}")
        await socketio.emit("process-state", {
            "stage": "error",
            "message": f"Failed to generate subtitles: {str(e)}",
            "progress": 0,
        })

    return output_path


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
