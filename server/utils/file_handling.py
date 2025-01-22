from pathlib import Path


def cleanup_temp_files(temp_dir: Path):
    """
    Remove all files from the temporary directory.
    """
    for file in temp_dir.iterdir():
        if file.is_file():
            file.unlink()
