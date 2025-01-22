from langchain_groq import ChatGroq
from langchain.schema import HumanMessage
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from decouple import config
GROQ_API_KEY = config("GROQ_API_KEY")
# Initialize the Groq model with logical parameters

# Initialize the Groq model
llm = ChatGroq(
    name="whisper-large-v3",
    temperature=0.2,  # Slight creativity for translation
    max_retries=3,  # Retry in case of transient issues
    max_tokens=1000,  # Adjust based on expected translation size

    streaming=True,  # Enable streaming output
    api_key=GROQ_API_KEY,  # API key
)


def translate_text_groq(source_text, source_lang, target_lang):
    """
    Translate text using Groq's Chat model (via LangChain).
    Args:
        source_text (str): The text to translate.
        source_lang (str): The source language code (e.g., "en", "de").
        target_lang (str): The target language code (e.g., "en", "de").

    Returns:
        str: Translated text.
    """
    # Create the messages list explicitly
    messages = [
        HumanMessage(
            content=(
                f"Translate the following text from {
                    source_lang} to {target_lang}:"
                f"\n\n{source_text}"
            )
        )
    ]

    # Pass the messages to the model
    response = llm(messages=messages)
    translated_text = response.content

    # Remove additional notes or explanations if present
    if "Note:" in translated_text:
        translated_text = translated_text.split("Note:")[0].strip()

    return translated_text


# Example usage
if __name__ == "__main__":
    source_text = "Hello, how are you?"
    source_lang = "en"  # Source language
    target_lang = "de"  # Target language

    translated_text = translate_text_groq(
        source_text, source_lang, target_lang)
    print(translated_text)
