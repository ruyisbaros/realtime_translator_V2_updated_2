import axios from "axios";

export const uploadFileWithRetry = async (
  file,
  retries = 3,
  onProgress = () => {},
  setUploadProgress,
  setIsCanceled
) => {
  const controller = new AbortController(); // Create an AbortController
  const { signal } = controller; // Extract the signal

  let attempts = 0;

  const upload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      attempts++;
      const response = await axios.post("http://localhost:8000/upload", file, {
        signal, // Pass the signal to Axios
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setUploadProgress(progress);
          onProgress(progress);
        },
      });
      return response.data; // Return the server's response if successful
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Upload canceled");
        setIsCanceled(true); // Update the state to show the upload was canceled
        throw new Error("Upload canceled by the user");
      }

      if (attempts < retries) {
        console.log(`Retrying upload... Attempt ${attempts}/${retries}`);
        return upload(); // Retry the upload
      } else {
        console.error("Upload failed after all retries");
        throw error; // Throw error after exceeding retries
      }
    }
  };

  return { upload, controller }; // Return the upload function and controller
};
