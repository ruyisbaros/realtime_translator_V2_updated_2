import { useSelector } from "react-redux";

const UploadVideoProgress = () => {
  const { progress_state } = useSelector((store) => store.video_subtitles);

  // Destructure progress_state for clarity
  const { stage, message, progress } = progress_state;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 text-gray-200 rounded-2xl p-8 w-3/4 max-w-[800px] h-[600px] shadow-2xl border border-gray-700 relative">
        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <span
              className={`${
                stage === "uploading" ? "text-teal-400" : "text-gray-400"
              }`}
            >
              Uploading
            </span>
            <span
              className={`${
                stage === "extracting" ? "text-teal-400" : "text-gray-400"
              }`}
            >
              Extracting
            </span>
            <span
              className={`${
                stage === "batching" ? "text-teal-400" : "text-gray-400"
              }`}
            >
              Batching
            </span>
            <span
              className={`${
                stage === "transcribing" ? "text-teal-400" : "text-gray-400"
              }`}
            >
              Transcribing
            </span>
            <span
              className={`${
                stage === "translating" ? "text-teal-400" : "text-gray-400"
              }`}
            >
              Translating
            </span>
            <span
              className={`${
                stage === "finalizing" ? "text-teal-400" : "text-gray-400"
              }`}
            >
              Finalizing
            </span>
          </div>
          <div className="relative w-full h-2 bg-gray-800 rounded-full mt-2">
            <div
              className="absolute top-0 left-0 h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Main Progress Section */}
        <h3 className="text-2xl font-semibold mb-8 text-center text-teal-400 tracking-wide">
          {message || "Initializing..."}
        </h3>

        {/* GIF Section */}
        <div className="flex justify-center items-center h-[300px]">
          {stage === "uploading" && (
            <img
              src="/assets/uploading.gif" // Replace with your actual path
              alt="Uploading..."
              className="w-40"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/transcription.gif";
              }}
            />
          )}
          {stage === "extracting" && (
            <img
              src="/assets/extracting.gif" // Replace with your actual path
              alt="Extracting audio..."
              className="w-40"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/transcription.gif";
              }}
            />
          )}
          {stage === "batching" && (
            <img
              src="/assets/subtitle.gif" // Replace with your actual path
              alt="Batching audio..."
              className="w-40"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/transcription.gif";
              }}
            />
          )}
          {stage === "transcribing" && (
            <img
              src="/assets/transcription.gif" // Replace with your actual path
              alt="Transcribing audio..."
              className="w-40"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/transcription.gif";
              }}
            />
          )}
          {stage === "translating" && (
            <img
              src="/assets/translation.gif" // Replace with your actual path
              alt="Translating text..."
              className="w-40"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/transcription.gif";
              }}
            />
          )}
          {stage === "finalizing" && (
            <img
              src="/assets/subtitle.gif" // Replace with your actual path
              alt="Finalizing subtitles..."
              className="w-40"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/transcription.gif";
              }}
            />
          )}
          {stage === "" && (
            <img
              src="/assets/jarvis.gif"
              alt="Idle state..."
              className="w-40"
            />
          )}
        </div>

        {/* Fun User Message */}
        <div className="flex justify-center mt-6">
          <p className="text-gray-400 text-sm italic">
            {stage === "uploading"
              ? "Hold tight, uploading your video!"
              : stage === "extracting"
              ? "Hang on, we’re pulling out the audio!"
              : stage === "batching"
              ? "Hang on, We're splitting the audio file into small pieces!"
              : stage === "transcribing"
              ? "Hang on, we’re converting audio to text!"
              : stage === "translating"
              ? "Translations in progress..."
              : stage === "finalizing"
              ? "Almost there! Generating subtitles..."
              : "This process may take some time. Thank you for your patience."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadVideoProgress;
