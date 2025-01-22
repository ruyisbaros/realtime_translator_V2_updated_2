import torch
import whisper


def load_whisper_model():
    """
    Load Whisper model locally, ensuring GPU usage if available.
    """

    # Clear GPU cache
    torch.cuda.empty_cache()

    # Specify model size or local cache directory
    model_size = "medium"  # Whisper model size
    local_model_path = "/home/ahmet/.cache/whisper"  # Directory containing the model

    # Load model from the local cache
    model = whisper.load_model(model_size, download_root=local_model_path,
                               device="cuda" if torch.cuda.is_available() else "cpu")
    print(f"Whisper model ('{model_size}') loaded successfully on {
          model.device}.")
    return model


def transcribe_audio(model, audio_path):
    """
    Transcribe audio using Whisper model.
    """
    result = model.transcribe(audio_path, language="en")
    return result["text"]
