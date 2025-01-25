import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const STEPS = [
  "uploading",
  "extracting",
  "batching",
  "transcribing",
  "translating",
  "finalizing",
];

const UploadVideoProgress = () => {
  const messagesEndRef = useRef(null);
  const { progress_state, activeMessages } = useSelector(
    (store) => store.video_subtitles
  );

  // Find the current stage
  const currentStage = STEPS.find(
    (step) => progress_state[step]?.progress < 100
  );
  const currentStageData = currentStage ? progress_state[currentStage] : null;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeMessages]);

  return (
    <div className="fixed max-h[800px] overflow-hidden inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 text-gray-200 rounded-2xl p-8 w-3/4 max-w-[800px] h-[600px] shadow-2xl border border-gray-700 relative">
        {/* Progress Tracker */}
        <div className="mb-8 flex items-center justify-between w-full">
          {STEPS.map((stage) => (
            <div key={stage} className="flex flex-col items-center w-full">
              {/* Stage Name */}
              <div
                className={`text-sm font-bold ${
                  progress_state[stage]?.progress === 100
                    ? "text-[#db1102]"
                    : progress_state[stage]?.progress > 0
                    ? "text-[#db1102] "
                    : "text-gray-400"
                }`}
              >
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-2 bg-gray-800 rounded-full mt-2">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${
                    progress_state[stage]?.progress === 100
                      ? "bg-[#db1102]"
                      : "bg-teal-500/40"
                  }`}
                  style={{
                    width: `${progress_state[stage]?.progress || 0}%`,
                  }}
                >
                  {progress_state[stage]?.progress < 100 && (
                    <span
                      className={`absolute top-[.7rem]  text-[10px] font-semibold ${
                        progress_state[stage]?.progress === 100
                          ? "text-[#db1102]"
                          : "text-teal-400"
                      }`}
                      style={{
                        left: `${progress_state[stage]?.progress || 0}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      {Math.floor(progress_state[stage]?.progress || 0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Stage Message */}
        <h3 className="text-2xl font-semibold mb-8 text-center text-teal-400 tracking-wide">
          {currentStage &&
            (currentStageData?.message ||
              "Preparing your video for processing...")}
        </h3>

        {/* GIF Section */}
        <div className="flex justify-center items-center h-[300px]">
          {currentStage ? (
            <img
              src="/assets/general.gif"
              alt={`${currentStage}...`}
              className="w-[300px] rounded-xl shadow-2xl"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/transcription.gif";
              }}
            />
          ) : (
            <p className="text-gray-400 font-bold text-[20px]">
              All stages completed!
            </p>
          )}
        </div>
        {/* Matrix-Style Message Box */}
        <div className="bg-gray-900 rounded-xl p-4 shadow-md h-[100px] overflow-hidden relative mt-6">
          <div className="absolute inset-0 overflow-y-auto">
            <ul className="space-y-1 text-teal-400 text-sm font-mono">
              {activeMessages.map((msg, idx) => (
                <li key={idx} className="animate-fade text-center">
                  {msg}
                </li>
              ))}
              <div ref={messagesEndRef} />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadVideoProgress;
