import { useEffect, useRef, useState } from "react";
import "./styles.css";
import { useSelector } from "react-redux";
//import { setIsLoadingRdx } from "../redux/selectedAudioSrc";
const ContentCenterDown = () => {
  //const dispatch = useDispatch();

  const { isLoading, translated_text } = useSelector(
    (store) => store.audio_src
  );
  const [defaultTextText, setDefaultTextText] = useState("");
  const outputAreaRef = useRef(null);
  const outputContentRef = useRef(null);

  // Add a test translation output for showing purposes
  useEffect(() => {
    setDefaultTextText(
      `
      >> TRANSLATION STARTED...
      >> Analyzing source: Audio source 0x1234
       >> Input:  This is a test input.
       >> Processing...
       >> Output: Test input translated here.
      `
    );
    setTimeout(() => {
      setDefaultTextText((prevText) => {
        return `${prevText}
           >> Analyzing source: Audio source 0x1234
          >> Input:  This is a test input number 2.
          >> Processing...
           >> Output: Test input number 2 translated here.`;
      });
      setTimeout(() => {
        setDefaultTextText((prevText) => {
          return `${prevText}
           >> Analyzing source: Audio source 0x1234
          >> Input: This is a test input number 3. This is a multiline text for testing purposes.
          >> Processing...
           >> Output: Test input number 3 translated here. This is also multiline.`;
        });
      }, 500);
    }, 1000);
  }, []);
  useEffect(() => {
    if (outputAreaRef.current) {
      outputAreaRef.current.scrollTo({
        top: outputAreaRef.current.scrollHeight,
        behavior: "smooth", // Adds smooth scrolling
      });
    }
  }, [translated_text]);

  return (
    <div className="translation-output-container h-[57%] QPushButton max-w-[95%] m-auto mt-2">
      <div
        className="translation-output-area  mt-[10px] overflow-auto" // Enable scrolling if content overflows
        ref={outputAreaRef}
      >
        <div className="translation-output-content">
          {isLoading ? (
            <div className="loading-animation">
              <p>
                Processing<span className="dots">...</span>
              </p>
            </div>
          ) : translated_text ? (
            translated_text.split("\n").map((line, index) => (
              <div
                key={index}
                ref={outputContentRef}
                className="output-text_o pb-3"
              >
                {line}
              </div>
            ))
          ) : (
            <div className="output-text_d">{defaultTextText}</div>
          )}
        </div>
        {/* Optional empty div to help smooth scrolling */}
        <div className="scroll-anchor" />
      </div>
    </div>
  );
};

export default ContentCenterDown;
