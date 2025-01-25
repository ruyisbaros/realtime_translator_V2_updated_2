import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { formatMilliseconds } from "../../utils/timeUtils";
import { setParsedSubtitlesRdx } from "../../redux/videoSubtitleSlice";
import "./subtitleStyles.css";

// eslint-disable-next-line react/prop-types
const TranscriptEditor = ({ currentTime }) => {
  const { parsed_subtitles } = useSelector((store) => store.video_subtitles);
  const [editableSubtitles, setEditableSubtitles] = useState(parsed_subtitles);
  const dispatch = useDispatch();

  // Sync Redux state with local state on change
  const handleTextChange = (index, field, value) => {
    const updatedSubtitles = [...editableSubtitles];
    updatedSubtitles[index][field] = value;
    setEditableSubtitles(updatedSubtitles);

    // Synchronize with Redux
    dispatch(setParsedSubtitlesRdx(updatedSubtitles));
  };

  // Auto-scroll and highlight active subtitle
  useEffect(() => {
    const activeIndex = editableSubtitles.findIndex(
      (subtitle) =>
        currentTime >= subtitle.start_time && currentTime <= subtitle.end_time
    );

    if (activeIndex !== -1) {
      const activeElement = document.getElementById(`subtitle-${activeIndex}`);
      activeElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentTime, editableSubtitles]);

  return (
    <div className="w-[50%] bg-gray-800 rounded-xl p-6 shadow-md overflow-hidden">
      <h2 className="text-teal-400 text-xl font-semibold mb-4">
        Transcription & Translation Editor
      </h2>
      <div className="scroll-container overflow-y-auto max-h-full">
        {editableSubtitles.map((subtitle, index) => {
          const isActive =
            currentTime >= subtitle.start_time &&
            currentTime <= subtitle.end_time;

          return (
            <div
              key={index}
              id={`subtitle-${index}`}
              className={`border-b border-gray-600 pb-4 mb-4 flex flex-col ${
                isActive ? "bg-teal-700/30 rounded-lg" : ""
              }`}
            >
              <div className="text-gray-400 text-sm mb-2">
                {formatMilliseconds(subtitle.start_time)} →{" "}
                {formatMilliseconds(subtitle.end_time)}
              </div>
              <div className="flex flex-col gap-2">
                {/* Original Text */}
                <div className="scroll-container">
                  <label className="text-gray-300 text-sm">
                    Original [DE]:
                  </label>
                  <textarea
                    value={subtitle.text}
                    onChange={(e) =>
                      handleTextChange(index, "text", e.target.value)
                    }
                    className="scroll-container resize-none bg-gray-700 text-gray-200 w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                {/* Translations */}
                {subtitle.translations &&
                  Object.keys(subtitle.translations).map((lang) => (
                    <div key={lang}>
                      <label className="text-gray-300 text-sm">
                        Translation [{lang.toUpperCase()}]:
                      </label>
                      <textarea
                        value={subtitle.translations[lang]}
                        onChange={(e) =>
                          handleTextChange(
                            index,
                            `translations.${lang}`,
                            e.target.value
                          )
                        }
                        className="scroll-container resize-none bg-gray-700 text-gray-200 w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                      />
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranscriptEditor;
