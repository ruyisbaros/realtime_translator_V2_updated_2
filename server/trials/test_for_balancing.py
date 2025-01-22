import asyncio
import time
import whisper
import torch


def time_it(label, func, *args, **kwargs):
    """
    Measure the execution time of a function.
    Args:
        label (str): A label to identify the operation.
        func (callable): The function to measure.
        *args: Positional arguments for the function.
        **kwargs: Keyword arguments for the function.
    Returns:
        The result of the function and the elapsed time.
    """
    start_time = time.time()
    result = func(*args, **kwargs)
    elapsed_time = time.time() - start_time
    print(f"{label}: {elapsed_time:.2f}s")
    return result, elapsed_time


async def preprocess_audio(audio_chunk):
    """
    Simulate audio preprocessing (e.g., converting to spectrogram).
    """
    print("Preprocessing audio chunk...")
    await asyncio.sleep(0.5)  # Simulate a delay for preprocessing
    return audio_chunk


async def transcribe_chunk(model, audio_chunk):
    """
    Transcribe a single audio chunk using the Whisper model.
    """
    print("Starting transcription on GPU...")
    result = model.transcribe(audio_chunk, language="en")
    print("Transcription completed.")
    return result["text"]


async def process_real_time_audio(model, audio_chunks):
    """
    Process audio chunks in real-time, with preprocessing on CPU and transcription on GPU.
    """
    for audio_chunk in audio_chunks:
        # Preprocess and transcribe in parallel
        processed_chunk = await preprocess_audio(audio_chunk)
        transcription = await transcribe_chunk(model, processed_chunk)
        print(f"Transcription: {transcription}")

if __name__ == "__main__":
    # Load the model
    model, load_time = time_it(
        "Model Loading",
        whisper.load_model,
        "medium",  # Model size
        device="cuda" if torch.cuda.is_available() else "cpu"
    )
    print(f"Model loaded successfully in {load_time:.2f} seconds.")

    # Simulated 2-second audio chunks
    audio_chunks = ["chunk1.wav", "chunk2.wav", "chunk3.wav"]

    # Run the real-time processing loop
    asyncio.run(process_real_time_audio(model, audio_chunks))
