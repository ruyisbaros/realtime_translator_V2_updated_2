import { useState } from "react";

// eslint-disable-next-line react/prop-types
const TranscriptEditor = ({ subtitles }) => {
  const [editableSubtitles, setEditableSubtitles] = useState(subtitles);

  const handleTextChange = (index, field, value) => {
    // Update the specific subtitle segment
    const updatedSubtitles = [...editableSubtitles];
    updatedSubtitles[index][field] = value;
    setEditableSubtitles(updatedSubtitles);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-md h-full">
      <h2 className="text-teal-400 text-xl font-semibold mb-4">
        Transcription & Translation Editor
      </h2>
      <div className="overflow-y-auto max-h-[500px]">
        {editableSubtitles.map((subtitle, index) => (
          <div
            key={index}
            className="border-b border-gray-600 pb-4 mb-4 flex flex-col"
          >
            <div className="text-gray-400 text-sm mb-2">
              {subtitle.start_time} → {subtitle.end_time}
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <label className="text-gray-300 text-sm">Original [DE]:</label>
                <textarea
                  value={subtitle.text}
                  onChange={(e) =>
                    handleTextChange(index, "text", e.target.value)
                  }
                  className="bg-gray-700 text-gray-200 w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
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
                      className="bg-gray-700 text-gray-200 w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptEditor;
