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


def extract_audio_from_video(video_path: str, output_audio_path: str) -> None:
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
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"FFmpeg error: {e.stderr.decode('utf-8')}")
