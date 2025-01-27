import TranscriptEditor from "./TranscriptEditor";
import PlayVideoEditor from "./PlayVideoEditor";
const VideoEditor = () => {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200">
      <div className=" p-2 h-full">
        {/* Top Section */}
        <div className="flex gap-2 h-[60%] border-b border-gray-700">
          {/* Left: Editable Transcription */}
          <TranscriptEditor />
          {/* Right: Video Player */}
          <PlayVideoEditor />
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
