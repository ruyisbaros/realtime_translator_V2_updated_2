import TranscriptEditor from "./TranscriptEditor";
import PlayVideoEditor from "./PlayVideoEditor";
import ExportVideo from "./ExportVideo";
const VideoEditor = () => {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200">
      <div className=" p-2 h-full">
        {/* Top Section */}
        <div className="flex gap-2 h-[480px] ">
          {/* Left: Editable Transcription */}
          <TranscriptEditor />
          {/* Right: Video Player */}
          <PlayVideoEditor />
        </div>

        {/* Bottom Section */}
        <div className="h-[135px] flex items-center mt-2">
          <ExportVideo />
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;
