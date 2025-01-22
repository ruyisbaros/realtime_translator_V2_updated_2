import { useEffect, useState } from "react";

const UploadPopup = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleUpload = (file) => {
    if (!file) return;
    console.log("Selected file:", file.name);
    setIsUploading(true);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setUploadComplete(true);
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length) {
      handleUpload(files[0]);
      setSelectedFile(files[0]);
    }
  };
  // Reset state after 3 seconds when upload completes
  useEffect(() => {
    if (uploadComplete) {
      const timeout = setTimeout(() => {
        setIsUploading(false);
        setUploadComplete(false);
        setProgress(0); // Reset progress bar
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [uploadComplete]);
  console.log(uploadComplete);
  return (
    <div className="h-[99%] w-[99%] flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-black to-gray-900 text-gray-200">
      {/* Header Section */}
      <div className="max-w-3xl text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-teal-400 font-orbitron">
          Welcome to the Video Subtitle Translator!
        </h1>
        <p className="text-lg leading-relaxed font-orbitron">
          Create subtitles for your videos with ease while translating content
          into multiple languages. Whether you’re working with a local video
          file, a YouTube link, or a simple drag-and-drop, our tool ensures a
          seamless experience. Empower your audience with accurate, real-time
          translations and subtitles.
        </p>
      </div>

      {/* Upload Popup */}
      <div
        className={`w-4/5 max-w-lg p-6 bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-lg shadow-lg text-center z-50 ${
          isDragging ? "border-2 border-teal-400 bg-gray-800" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!isUploading ? (
          uploadComplete ? (
            <p className="text-lg font-medium text-green-400">
              {selectedFile.name} loaded successfully!
            </p>
          ) : (
            <div
              className="border-2 border-dashed border-teal-400 p-8 rounded-lg cursor-pointer transition-colors duration-300 hover:border-teal-300"
              onClick={() => document.getElementById("fileInput").click()}
            >
              <input
                id="fileInput"
                type="file"
                hidden
                accept="video/*"
                onChange={(e) => handleUpload(e.target.files[0])}
              />
              <div className="text-6xl text-teal-400 mb-4 animate-pulse">
                📹
              </div>
              <p className="text-lg font-medium">
                Drag & drop your video here, or click to browse.
              </p>
            </div>
          )
        ) : (
          <div>
            <p className="mb-4 text-lg font-medium">Uploading... {progress}%</p>
            <div className="w-full h-3 bg-gray-700 rounded-lg overflow-hidden">
              <div
                className="h-full bg-teal-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {/* Display filename */}
            {selectedFile && (
              <p className="mt-4 text-sm font-medium text-teal-400">
                Loading: {selectedFile.name}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPopup;
