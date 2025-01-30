# from langchain.llms import OpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate, ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
from openai import OpenAI
import os
import json
load_dotenv()

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
MODEL = 'gpt-4o-mini'
client = OpenAI(api_key=OPENAI_API_KEY,)
llm = ChatGroq(
    model="llama-3.1-70b-versatile",
    temperature=0.4,
    max_tokens=2048,  # Limit token usage for efficiency
    timeout=30,  # Ensures request doesn't hang forever
    max_retries=3,  # Retries failed requests up to 3 times
    api_key=GROQ_API_KEY,  # Use your GroQ API key
)
# Define prompt for AI processing
timestamp_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an advanced AI that structures timestamps for subtitles."),
    ("human",
        "You will analyze the transcript below and **generate optimized timestamps**.\n\n"
        "**Instructions:**\n"
        "- Each timestamp is provided in `[HH:MM:SS - HH:MM:SS]` format.\n"
        "- **DO NOT modify the timestamps, only adjust placement based on logical breaks.**\n"
        "- Ensure timestamps **do not overlap** or break sentences in half.\n"
        "- Format output in **valid JSON**:\n"
        '[{"start": "00:00:01.000", "end": "00:00:03.000", "text": "Hello world"}]\n\n'
        "**Transcript:**\n"
        "{transcript}"
     )
])

# Define LangChain LLM Chain
timestamp_chain = LLMChain(llm=llm, prompt=timestamp_prompt)


def split_transcript_with_delimiter(full_transcript, chunk_size=10):
    """
    Splits the transcript using `--splitter--` and chunks in groups of `chunk_size`.
    """
    segments = full_transcript.split("--splitter--")
    chunks = [segments[i: i + chunk_size]
              for i in range(0, len(segments), chunk_size)]
    return chunks


test_transcript = """
[00:00:01 - 00:00:05] Hello everyone, welcome to the video.
[00:00:06 - 00:00:10] Today we will discuss React.js fundamentals.
"""


async def generate_structured_timestamps_ai(formatted_transcript):
    """
    Sends the full formatted transcript to an AI model (GPT-4o Mini or LLaMA 3)
    to generate structured timestamps for topic-based segmentation.
    Avoids token cutoff issues.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Change to 'llama-3-70b' if needed
            messages=[
                {"role": "system", "content": "You are an AI that generates structured timestamps for videos."},
                {"role": "user", "content": f"""
                    You will receive a transcript of a long video. Your job is to generate structured timestamps,
                    ensuring that each major topic is correctly grouped.

                    **Rules for structuring timestamps:**
                    - **Group related topics together** into larger sections.
                    - **Do not split** a topic too soon; wait for clear topic changes.
                    - **Target approximately 1 timestamp per 5-8 minutes** of content.
                    - **Each timestamp should summarize the key idea** of that section.
                    - **Summaries must be in the same language as the transcripts.
                    - **If the content is fast-paced**, allow slightly more timestamps.

                    **IMPORTANT:** Your response **must only contain valid JSON** formatted like this:
                    ```json
                    {{
                        "timestamps": [
                            {{"start": "HH:MM:SS", "end": "HH:MM:SS",
                                "text": "Concise topic summary"}}
                        ]
                    }}
                    ```

                    Transcript:
                    {formatted_transcript}
                """}
            ],
            response_format={"type": "json_object"},
            temperature=0.4
        )

        # ✅ Extract and parse JSON correctly
        raw_content = response.choices[0].message.content.strip()
        # print(f"💡 Raw AI Response: {raw_content}")  # Debugging

        # ✅ Extract the "timestamps" key properly
        parsed_json = json.loads(raw_content)
        if "timestamps" in parsed_json and isinstance(parsed_json["timestamps"], list):
            # ✅ Return only the timestamps list
            return parsed_json["timestamps"]
        else:
            print(f"⚠️ Unexpected JSON format: {parsed_json}")
            return []

    except json.JSONDecodeError as e:
        print(f"❌ JSON Parsing Error: {e}\\nResponse:\\n{raw_content}")
    except Exception as e:
        print(f"❌ Error generating timestamps: {e}")

    return []  # Return empty if failure
