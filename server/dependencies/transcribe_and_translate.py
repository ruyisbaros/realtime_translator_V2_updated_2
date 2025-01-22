

def transcribe_audio(audio_path,  whisper_model):
    """
    Transcribe audio to text with timestamps using Whisper.
    Args:
        audio_path (str): Path to the audio file to transcribe.
        whisper_model (WhisperModel): Loaded Whisper model instance.
    Returns:
        dict: Transcription with text, language, and timestamps.
    {
    "segments": [
        {"start": 0.0, "end": 2.0, "text": "Hello."},
        {"start": 15.0, "end": 17.0, "text": "Welcome back."}
    ]
}
    """
    whisper_model = whisper_model  # Access shared Whisper model
    try:
        # Run transcription
        result = whisper_model.transcribe(
            audio_path,
            task="transcribe",  # Transcription task

        )

        # Extract key details
        transcription_text = result.get("text", "")
        detected_language = result.get("language", "unknown")
        segments = result.get("segments", [])

        print(f"Detected language: {detected_language}")
        return {
            "text": transcription_text,
            "language": detected_language,
            "segments": segments,  # Includes timestamped subtitles
        }

    except Exception as e:
        print(f"Error during transcription: {e}")
        raise RuntimeError(f"Transcription failed: {e}")


def translate_text(
    text: str,
    model,
    tokenizer,
    target_lang: str,
    src_lang: str = None,

) -> str:
    """
    Translate text to the target language using the provided model and tokenizer.

    Args:
        text (str): The input text to translate.
        model: The Hugging Face model for translation.
        tokenizer: The Hugging Face tokenizer for translation.
        target_lang (str): The target language code (e.g., 'de' for German).
        src_lang (str, optional): The source language code. Defaults to None (auto-detection).
        device (str): The device to use ('cpu' or 'cuda'). Defaults to 'cpu'.

    Returns:
        str: The translated text.
    """
    try:
        tokenizer.src_lang = src_lang
        device = model.device
        # Tokenize input text
        inputs = tokenizer(
            text,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=512,
        ).to(device)

        # Set the target language
        forced_bos_token_id = tokenizer.lang_code_to_id[target_lang]

        # Generate translation
        outputs = model.generate(
            **inputs,
            forced_bos_token_id=forced_bos_token_id,
            max_length=512,
            num_beams=5,  # For more accurate translations
            early_stopping=True,
        )

        # Decode and return the translated text
        return tokenizer.decode(outputs[0], skip_special_tokens=True)

    except Exception as e:
        raise RuntimeError(f"Translation error: {str(e)}")
