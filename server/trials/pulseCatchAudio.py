import pyaudio
from pydub import AudioSegment
from pydub.utils import make_chunks
import subprocess


def get_pulse_monitor_source_name():
    """Gets the name of the default PulseAudio monitor source."""
    try:
        output = subprocess.check_output(['pactl', 'info']).decode()
        for line in output.splitlines():
            if "Default Sink:" in line:
                default_sink = line.split(":")[-1].strip()
                return f"{default_sink}.monitor"
    except Exception as e:
        print(f"Error getting PulseAudio info: {e}")
        return None


def capture_pulse_audio(chunk_duration_ms=500):
    """Captures audio from the PulseAudio monitor source."""
    monitor_source = get_pulse_monitor_source_name()
    if not monitor_source:
        print("Could not determine PulseAudio monitor source.")
        return

    p = pyaudio.PyAudio()
    stream = None
    try:
        stream = p.open(format=pyaudio.paFloat32,  # Or paInt16
                        channels=2,  # Or the number of channels of your sink
                        rate=44100,  # Or the sample rate of your sink
                        input=True,
                        input_device_name=monitor_source)

        while True:
            chunk = stream.read(1024)  # Adjust chunk size
            # Process the 'chunk' (bytes) - convert to numpy array for noise reduction
            yield chunk

    except Exception as e:
        print(f"Error capturing audio: {e}")
    finally:
        if stream:
            stream.stop_stream()
            stream.close()
        p.terminate()


# Example usage:
for audio_chunk in capture_pulse_audio():
    # Apply noise reduction to 'audio_chunk'
    # Send the processed audio to your API
    pass
