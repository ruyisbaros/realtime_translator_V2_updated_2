import fs from "fs";

import SrtParser from "srt-parser-2";
/**
 * Parse subtitles from a custom .srt file with translations.
 * @param {string} filePath Path to the .srt file
 * @param {string} language_detected Detected language
 * @returns {Array} Parsed subtitles array
 */
export const parseSubtitles = async (filePath, language_detected) => {
  try {
    const parser = new SrtParser();
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const parsedSubtitles = parser.fromSrt(fileContent);

    return parsedSubtitles.map((entry) => {
      // Original transcription is already available
      const original_text = entry.text;

      // Iterate over translations if they exist
      const translations = {};
      if (entry.translations) {
        Object.entries(entry.translations).forEach(([lang, translation]) => {
          translations[lang] = translation;
        });
      }

      return {
        start_time: entry.start,
        end_time: entry.end,
        text: original_text,
        translations: translations, // Include translations
        language: language_detected, // Detected language
      };
    });
  } catch (error) {
    console.error("Error parsing subtitles:", error);
    return [];
  }
};

/* OUTPUT OF PARSE-SYNC */
/* 
  [
  {
    start_time: 6000, // Milliseconds
    end_time: 15000,  // Milliseconds
    text: "Noch einmal kurz zu mir, mein Name ist David Losart, ich bin Software Engineer und seit über 10 Jahren im Web unterwegs und arbeite nun auch bereits seit 4 Jahren mit React.",
    translations: {
      EN: "My name is David Losart, I’m a software engineer and I’ve been on the web for more than 10 years and I’ve been working with React for 4 years.",
      ES: "Mi nombre es David Losart, soy ingeniero de software y llevo más de 10 años en la web y llevo 4 años trabajando con React."
    },
    language: "de"
  }
];
  
  */
