import torch
import whisper
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer


def load_whisper_model(model_config):
    """
    Load a Whisper model from a local cache, ensuring GPU usage if available.

    Args:
        model_config (dict): Configuration dictionary with `name` and `local_model_path`.

    Returns:
        whisper.Whisper: Loaded Whisper model.
    """
    torch.cuda.empty_cache()

    # Extract model details
    model_size = model_config["name"]  # Example: "medium"
    local_model_path = model_config["local_model_path"]

    # Load Whisper model
    print(f"Loading Whisper model '{model_size}' from {local_model_path}...")
    model = whisper.load_model(
        model_size,
        download_root=local_model_path,
        device="cuda" if torch.cuda.is_available() else "cpu"
    )

    print(f"Whisper model ('{model_size}') loaded successfully on {
          model.device}.")
    return model


def load_facebook_m2m100_local(local_model_path):
    """
    Load a Facebook M2M-100 model from a local path, ensuring GPU usage if available.

    Args:
        local_model_path (str): Local directory containing the Facebook model.

    Returns:
        tuple: Loaded model and tokenizer.
    """
    torch.cuda.empty_cache()

    # Set device and dtype
    device = "cuda" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device == "cuda" else torch.float32

    # Load the tokenizer
    print(f"Loading Facebook tokenizer from {local_model_path}...")
    tokenizer = M2M100Tokenizer.from_pretrained(local_model_path)

    # Load the model
    print(f"Loading Facebook model from {
          local_model_path} on {device} with dtype={dtype}...")
    model = M2M100ForConditionalGeneration.from_pretrained(
        local_model_path, torch_dtype=torch.float16,
        device_map="auto")

    # Apply optimizations
    if dtype == torch.float16:
        model = model.half()  # Convert to float16 for GPU
    model = model.to(device)

    print(
        f"Facebook M2M-100 model loaded successfully from {local_model_path} on {device}.")
    return model, tokenizer
