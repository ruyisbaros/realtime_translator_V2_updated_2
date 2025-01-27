import os
import glob


def clean_temp_files(directory):
    """
    Delete all .mp4 and .wav files from the specified directory.

    Parameters:
        directory (str): Path to the directory to clean.
    """
    try:
        # Define patterns for files to delete
        file_patterns = ["*.mp4", "*.wav"]

        # Iterate over patterns and delete matching files
        for pattern in file_patterns:
            files = glob.glob(os.path.join(directory, pattern))
            for file in files:
                os.remove(file)
                print(f"Deleted: {file}")

        print("Temporary files cleaned successfully!")
    except Exception as e:
        print(f"Error cleaning temporary files: {e}")
