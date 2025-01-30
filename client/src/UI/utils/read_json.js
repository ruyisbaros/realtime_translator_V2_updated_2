export const fetchSubtitleJson = async (path) => {
  try {
    // Replace absolute file path with FastAPI's static URL
    const relativePath = path.split("server/temp_video/")[1]; // Extract relative path
    console.log(relativePath);
    const url = `http://localhost:8000/temp_video/${relativePath}`; // Construct URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching subtitle JSON:", error);
    return null;
  }
};

export const convertPathsToUrls = (paths) => {
  return paths.map((path) => {
    const relativePath = path.split("server/temp_video/")[1]; // Extract relative path
    return `http://localhost:8000/temp_video/${relativePath}`;
  });
};
export const convertPathToUrl = (path) => {
  const relativePath = path.split("server/temp_video/")[1]; // Extract relative path
  return `http://localhost:8000/temp_video/${relativePath}`;
};

// Function to parse VTT timestamps into JSON
export const parseVtt = (vttText) => {
  const lines = vttText.split("\n");
  const timestamps = [];
  let currentTimestamp = null;

  lines.forEach((line) => {
    if (line.includes("-->")) {
      const [start, end] = line.split(" --> ");
      currentTimestamp = { start: start.trim(), end: end.trim(), text: "" };
    } else if (currentTimestamp && line.trim()) {
      currentTimestamp.text = line.trim();
      timestamps.push(currentTimestamp);
      currentTimestamp = null;
    }
  });

  return timestamps;
};

// Function to jump to timestamp when clicked
