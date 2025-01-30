import pysrt
import webvtt
import os
import re
import json


def parse_subtitles(file_path):
    """
    Parse subtitles from an SRT or VTT file and save the parsed output as a JSON file.
    Parameters:
        file_path (str): Path to the subtitle file (.srt or .vtt).
    Returns:
        str: Path to the generated JSON file.
    """
    try:
        # Infer subtitle format from file extension
        file_format = os.path.splitext(file_path)[1].lower()

        # Ensure the format is supported
        if file_format not in [".srt", ".vtt"]:
            raise ValueError(f"Unsupported subtitle format: {file_format}")

        # Parse the subtitles
        if file_format == ".srt":
            subtitles = pysrt.open(file_path)
            parsed_subtitles = []

            for entry in subtitles:
                parsed_subtitles.append({
                    "start_time": entry.start.ordinal,  # In milliseconds
                    "end_time": entry.end.ordinal,      # In milliseconds
                    "text": entry.text.strip(),         # Single line of text
                })

        elif file_format == ".vtt":
            with open(file_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
            parsed_subtitles = []
            i = 0
            while i < len(lines):
                line = lines[i].strip()
                # Regex to detect the time block
                timecode_match = re.match(
                    r"(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})", line)

                if timecode_match:
                    start_time, end_time = timecode_match.groups()
                    i += 1  # go to text line
                    text_lines = []

                    while i < len(lines) and not re.match(r"(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})", lines[i].strip()):
                        text_lines.append(lines[i].strip())
                        i += 1
                    text = " ".join(text_lines)

                    parsed_subtitles.append({
                        "start_time": format_time_to_ms(start_time),
                        "end_time": format_time_to_ms(end_time),
                        "text": text,
                    })
                else:
                    i += 1  # skip line
        else:
            raise ValueError(f"Unsupported subtitle format: {file_format}")

        # Save as JSON
        output_path = os.path.splitext(file_path)[0] + ".json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(parsed_subtitles, f, ensure_ascii=False, indent=4)
        return output_path

    except Exception as e:
        print(f"Error parsing subtitles: {e}")
        return None


def format_time_to_ms(time_string):
    """
    Convert a VTT timestamp to milliseconds.
    """
    hours, minutes, seconds = map(
        float, time_string.replace(",", ".").split(":"))
    return int((hours * 3600 + minutes * 60 + seconds) * 1000)


def parse_vtt_for_ai(vtt_content):
    """
    Extracts text + timestamps from VTT content.
    """
    lines = vtt_content.split("\n")

    # Ensure to skip the first line (WEBVTT)
    if lines[0].strip().upper() == "WEBVTT":
        lines = lines[1:]

    parsed_segments = []

    for i in range(len(lines)):
        if "-->" in lines[i]:  # Found a timestamp line
            start_time, end_time = lines[i].split(" --> ")
            text = lines[i + 1] if i + 1 < len(lines) else ""
            parsed_segments.append(
                {"start": start_time.strip(), "end": end_time.strip(), "text": text.strip()})

    return parsed_segments


def convert_to_ai_format(timestamp_data):
    """
    Converts timestamped text into AI-friendly input format.
    """
    formatted_text = "The following are transcript segments with timestamps:\n\n"
    for segment in timestamp_data:
        formatted_text += f"[{segment['start']
                              } - {segment['end']}]\n{segment['text']}\n\n"

    return formatted_text.strip()


def save_new_vtt(new_timestamps, file_path):
    """
    Converts AI-generated timestamps back into VTT format.
    """
    vtt_content = "WEBVTT\n\n"
    for segment in new_timestamps:
        vtt_content += f"{segment['start']
                          } --> {segment['end']}\n{segment['text']}\n\n"

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(vtt_content)
