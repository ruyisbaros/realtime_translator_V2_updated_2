import TranscriptEditor from "./TranscriptEditor";
import PlayVideoEditor from "./PlayVideoEditor";
import { useState } from "react";
const VideoEditor = () => {
  const [currentTime, setCurrentTime] = useState(0); // Current time in milliseconds

  const handleTimeUpdate = (time) => {
    setCurrentTime(time); // Update current time from video player
  };
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200">
      <div className="flex flex-col h-full">
        {/* Top Section */}
        <div className="flex h-[60%] border-b border-gray-700">
          {/* Left: Editable Transcription */}
          <TranscriptEditor currentTime={currentTime} />
          {/* Right: Video Player */}
          <PlayVideoEditor onTimeUpdate={handleTimeUpdate} />
        </div>

        {/* Bottom Section */}
        <div className="h-[40%] p-4">
          <h2 className="text-lg font-semibold">Interactive Timeline</h2>
          <div className="mt-4">[Timeline Placeholder]</div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;
