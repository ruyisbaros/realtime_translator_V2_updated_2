import { useRef, useState } from "react";
import { useSelector } from "react-redux";

// eslint-disable-next-line react/prop-types, no-unused-vars
const PlayVideoEditor = ({ onTimeUpdate }) => {
  const videoRef = useRef();
  const { parsed_subtitles, previewUrl } = useSelector(
    (store) => store.video_subtitles
  );
  console.log(previewUrl);
  const [selectedLanguage, setSelectedLanguage] = useState("Original"); // Default to original subtitles
  const [currentTime, setCurrentTime] = useState(0);
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(Math.floor(videoRef.current.currentTime * 1000)); // Convert to milliseconds
    }
  };

  return (
    <div className="bg-gray-800 w-[50%] rounded-xl p-6 shadow-md max-h-full overflow-hidden flex flex-col">
      <video
        ref={videoRef}
        src={previewUrl || ""}
        controls
        onTimeUpdate={handleTimeUpdate} // Track time
        className="w-full h-3/4 rounded-lg"
      ></video>

      {/* Subtitle Display */}
      <div className="bg-gray-900 text-teal-400 p-4 mt-4 rounded-lg">
        {parsed_subtitles
          .filter(
            (subtitle) =>
              currentTime >= subtitle.start_time &&
              currentTime < subtitle.end_time
          )
          .map((subtitle, index) => (
            <div key={index} className="text-center">
              {selectedLanguage === "Original"
                ? subtitle.text
                : subtitle.translations[selectedLanguage]}
            </div>
          ))}
      </div>

      {/* Language Selector */}
      <div className="flex justify-end mt-4">
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="bg-gray-700 text-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <option value="Original">Original</option>
          {parsed_subtitles[0]?.translations &&
            Object.keys(parsed_subtitles[0].translations).map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default PlayVideoEditor;
