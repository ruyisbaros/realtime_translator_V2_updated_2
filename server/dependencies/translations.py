import torch
from langchain_groq import ChatGroq
from decouple import config

GROQ_API_KEY = config("GROQ_API_KEY")
# Initialize Groq model (singleton)
llm = ChatGroq(
    name="whisper-large-v3",
    temperature=0.2,
    max_retries=3,
    max_tokens=1000,
    streaming=True,
    api_key=GROQ_API_KEY,  # API key
)


def translate_text(model, tokenizer, text, src_lang, target_lang, device):
    """
    Translate text using the Facebook M2M-100 model.

    Args:
        model: Loaded Facebook M2M-100 model.
        tokenizer: Tokenizer for the M2M-100 model.
        text (str): Text to translate.
        src_lang (str): Source language code (e.g., "en").
        target_lang (str): Target language code (e.g., "de").
        device (str): Device to run the model on ("cuda" or "cpu").

    Returns:
        str: Translated text.
    """

    tokenizer.src_lang = src_lang

    # Tokenize the input text
    inputs = tokenizer(text, return_tensors="pt", padding=True).to(device)

    # Generate translation
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            forced_bos_token_id=tokenizer.lang_code_to_id[target_lang]
        )

    # Decode and return the translated text
    return tokenizer.decode(outputs[0], skip_special_tokens=True)


def transcribe_audio(model, audio_path, src_lang):
    """
    Transcribe audio using the Whisper model.

    Args:
        model: Loaded Whisper model.
        audio_path (str): Path to the audio file.
        src_lang (str): Source language (e.g., "en"). If None, Whisper auto-detects the language.

    Returns:
        dict: Transcription result containing "text" and detected "language".
    """
    try:
        transcription_options = {"task": "transcribe", "language": src_lang}

        # Perform transcription
        result = model.transcribe(audio_path, **transcription_options)
        if not result["text"].strip():  # Check if transcription is empty
            print("Silent mode detected.")
            return {"text": "No voice detected!.."}
        else:
            print("Voice detected")
            return {"text": result["text"]}
    except Exception as e:
        print(f"Error during transcription: {e}")
        return {"text": "Error during transcription"}
