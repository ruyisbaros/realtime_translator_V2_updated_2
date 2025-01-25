import pysrt
import re
import os


async def parse_subtitles(file_path, language_detected):
    """
    Parse the subtitles and extract translations if present.
    """
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read().replace('\r\n', '\n')  # Normalize line endings

        subtitles = pysrt.from_string(content)  # Parse the string
        parsed = []

        for entry in subtitles:
            # print("Parsed SRT Entry", entry)
            if not entry or not entry.text:
                print("skipping invalid entry")
                continue  # Skip invalid entries

            # Split subtitle text into lines
            lines = entry.text.split("\n")
            # First line is the original transcription
            original_text = lines[0].strip()

            # Extract translations (if present)
            translations = {}
            for line in lines[1:]:  # Remaining lines are translations
                line = line.strip()
                if line.startswith("[") and "]" in line:
                    try:
                        lang_code = line[1:line.index("]")].upper()
                        translations[lang_code] = line[line.index(
                            "]") + 1:].strip()
                    except:
                        print(f"Could not parse translation line {line}")

            # Append the parsed subtitle entry
            parsed.append({
                "start_time": entry.start.ordinal,  # Convert to milliseconds
                "end_time": entry.end.ordinal,      # Convert to milliseconds
                "text": original_text,             # Original transcription
                "translations": translations,      # Extracted translations
                "language": language_detected,     # Detected language
            })
        if not parsed:
            print(f"No valid subtitles parsed from: {file_path}")
        return parsed

    except FileNotFoundError as e:
        print(f"File Error: {e}")
        return []
    except Exception as e:
        print(f"Error parsing subtitles: {e}")
        return []

""" 
SubRipItem(
    index=1,
    start=SubRipTime(0, 0, 6, 0),  # Represents 00:00:06,000
    end=SubRipTime(0, 0, 15, 0),   # Represents 00:00:15,000
    text="Noch einmal kurz zu mir, mein Name ist David Losart.\n[EN] My name is David Losart.\n[ES] Mi nombre es David Losart."
)

"""


async def parse_vtt(file_path, language_detected):
    """
    Parse a VTT file and extract subtitles and translations.
    """
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        with open(file_path, "r", encoding="utf-8") as f:
            vtt_content = f.read()

        # Remove WEBVTT header
        vtt_content = vtt_content.replace("WEBVTT\n\n", "")

        # Split content into cues based on blank lines
        cues = vtt_content.strip().split("\n\n")
        parsed = []
        for cue in cues:
            # Split lines of cue
            lines = cue.strip().split("\n")

            if not lines or len(lines) < 2:
                print(f"skipping: {cue}")
                continue  # skip invalid cues

            # First line is the timing
            time_line = lines[0]

            # check for valid timing lines
            match = re.match(
                r'(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})', time_line)
            if not match:
                print("Invalid time format, skipping : ", time_line)
                continue

            start_time_str, end_time_str = match.groups()

            # Extracting the time to milliseconds
            start_time = time_to_milliseconds(start_time_str)
            end_time = time_to_milliseconds(end_time_str)

            # Second line onwards is the text content. The first line is the original
            original_text = lines[1]

            translations = {}
            for line in lines[2:]:
                if line.startswith("[") and "]" in line:
                    lang_code = line[1:line.index("]")].upper()
                    translations[lang_code] = line[line.index(
                        "]") + 1:].strip()

            # Append the parsed subtitle entry
            parsed.append({
                "start_time": start_time,  # Convert to milliseconds
                "end_time": end_time,      # Convert to milliseconds
                "text": original_text,             # Original transcription
                "translations": translations,      # Extracted translations
                "language": language_detected,     # Detected language
            })

        if not parsed:
            print(f"No VTT subtitles parsed from: {file_path}")

        return parsed

    except FileNotFoundError as e:
        print(f"File Error: {e}")
        return []
    except Exception as e:
        print(f"Error parsing subtitles: {e}")
        return []


def time_to_milliseconds(time_str):
    """Convert VTT time format to milliseconds"""
    hours, minutes, seconds = map(float, re.split(r'[:.]', time_str))
    total_milliseconds = int((hours * 3600 + minutes * 60 + seconds) * 1000)
    return total_milliseconds
