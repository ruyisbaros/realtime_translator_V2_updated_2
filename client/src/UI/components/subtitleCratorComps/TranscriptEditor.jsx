import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setParsedSubtitlesRdx } from "../../redux/videoSubtitleSlice";
import { formatMilliseconds } from "../../utils/timeUtils";
import { fetchSubtitleJson } from "../../utils/read_json";
import "./subtitleStyles.css";

const TranscriptEditor = () => {
  const dispatch = useDispatch();
  const { parsed_paths, currentTime, tracking_paths, language_detected } =
    useSelector((store) => store.video_subtitles);
  const [editableSubtitles, setEditableSubtitles] = useState([]);
  //const [subtitles, setSubtitles] = useState({});

  // Handle text change for original or translations
  const handleTextChange = (index, field, value) => {
    const updatedSubtitles = [...editableSubtitles];
    if (field.startsWith("translations.")) {
      const lang = field.split(".")[1];
      updatedSubtitles[index].translations[lang] = value;
    } else {
      updatedSubtitles[index][field] = value;
    }
    setEditableSubtitles(updatedSubtitles);

    // Update Redux state
    dispatch(setParsedSubtitlesRdx(updatedSubtitles));
  };

  // Auto-scroll to the active subtitle
  useEffect(() => {
    if (editableSubtitles && editableSubtitles.length > 0) {
      const activeIndex = editableSubtitles.findIndex(
        (subtitle) =>
          currentTime >= subtitle.start_time && currentTime <= subtitle.end_time
      );
      if (activeIndex !== -1) {
        const activeElement = document.getElementById(
          `subtitle-${activeIndex}`
        );
        activeElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentTime, editableSubtitles]);

  // Load subtitles from JSON files
  useEffect(() => {
    const loadSubtitles = async () => {
      const loadedSubtitles = {};
      let originalSubtitles = [];

      for (const [lang, path] of Object.entries(parsed_paths || {})) {
        try {
          const subtitleData = await fetchSubtitleJson(path); // Fetch JSON file
          if (subtitleData) {
            loadedSubtitles[lang] = subtitleData; // Add fetched content
            if (lang === "original") {
              originalSubtitles = subtitleData; // Store the original subtitles
            }
          }
        } catch (error) {
          console.error(`Failed to fetch subtitles for ${lang}:`, error);
        }
      }

      // Merge translations into original subtitles
      const combinedSubtitles = originalSubtitles.map((original, index) => {
        const translations = {};
        for (const [lang, subtitleArray] of Object.entries(loadedSubtitles)) {
          if (lang !== "original" && subtitleArray[index]) {
            translations[lang] = subtitleArray[index].text || "";
          }
        }
        return { ...original, translations }; // Include translations for each segment
      });

      //setSubtitles(loadedSubtitles); // Update state with loaded subtitles
      setEditableSubtitles(combinedSubtitles); // Update editable subtitles with translations
    };

    if (parsed_paths) {
      loadSubtitles();
    }
  }, [parsed_paths]);
  console.log(parsed_paths, tracking_paths);

  return (
    <div className="w-[50%] h-full bg-gray-800 rounded-xl p-6 shadow-md overflow-hidden">
      <h2 className="text-teal-400 text-xl font-semibold mb-4">
        Transcription & Translation Editor
      </h2>
      <div className="scroll-container overflow-y-auto max-h-full">
        {/* Ensure editableSubtitles is loaded */}
        {editableSubtitles && editableSubtitles.length > 0 ? (
          editableSubtitles.map((subtitle, index) => {
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
                {/* Timestamp */}
                <div className="text-gray-400 text-sm mb-2">
                  {formatMilliseconds(subtitle.start_time || 0)} →{" "}
                  {formatMilliseconds(subtitle.end_time || 0)}
                </div>
                <div className="flex flex-col gap-2">
                  {/* Original Text */}
                  <div>
                    <label className="text-gray-300 text-sm">
                      Original [{language_detected?.toUpperCase() || "N/A"}]:
                    </label>
                    <textarea
                      value={subtitle.text || ""}
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
                          value={subtitle.translations[lang] || ""}
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
          })
        ) : (
          <p className="text-gray-400 italic">Loading subtitles...</p>
        )}
      </div>
    </div>
  );
};

export default TranscriptEditor;
/* yes I agree.
Ok I am going another chat with you which we have been developing Microsoft Apple level api. 
But I will definetely come back this chat page and we will develop with you  */
