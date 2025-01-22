from dependencies.model_loaders import load_whisper_model, transcribe_audio

if __name__ == "__main__":
    # Load the model
    model = load_whisper_model()

    # Test transcription
    audio_file = "test.wav"  # Replace with your audio file
    result = transcribe_audio(model, audio_file)
    print("Transcription:", result["text"])
