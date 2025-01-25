import { useSelector } from "react-redux";
const VideoEditor = () => {
  // eslint-disable-next-line no-unused-vars
  const { selectedFile, translatedContent, parsed_subtitles } = useSelector(
    (store) => store.video_subtitles
  );
  console.log(parsed_subtitles);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200">
      <div className="flex flex-col h-full">
        {/* Top Section */}
        <div className="flex flex-1 border-b border-gray-700">
          {/* Left: Editable Transcription */}
          <div className="w-1/2 p-4 border-r border-gray-700">
            <h2 className="text-lg font-semibold">Editable Transcription</h2>
            <div className="mt-4">[Transcription Placeholder]</div>
          </div>
          {/* Right: Video Player */}
          <div className="w-1/2 p-4">
            <h2 className="text-lg font-semibold">Video Player</h2>
            <div className="mt-4">[Video Placeholder]</div>
          </div>
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
