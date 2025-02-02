import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentTimeRdx } from "../../redux/videoSubtitleSlice";
import {
  convertPathsToUrls,
  convertPathToUrl,
  parseVtt,
} from "../../utils/read_json";
import "./subtitleStyles.css";

const PlayVideoEditor = () => {
  const videoRef = useRef();
  const progressBarRef = useRef();
  const dispatch = useDispatch();

  // Redux state
  // eslint-disable-next-line no-unused-vars
  const {
    previewUrl,
    timestamps_path,
    tracking_paths,
    language_detected,
    currentTime,
  } = useSelector((store) => store.video_subtitles);

  // Local state
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  const [timestampData, setTimestampData] = useState([]);
  const [showTimestamp, setShowTimestamp] = useState(false);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTimeInMs = Math.floor(videoRef.current.currentTime); // Convert to milliseconds
      dispatch(setCurrentTimeRdx(currentTimeInMs));
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      videoElement.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, []);

  useEffect(() => {
    if (tracking_paths && tracking_paths.length > 0) {
      const urls = convertPathsToUrls(tracking_paths);
      setSubtitleTracks(urls); // Update state with converted URLs
    }
  }, [tracking_paths]);
  useEffect(() => {
    if (timestamps_path) {
      fetch(convertPathToUrl(timestamps_path)) // ✅ Load the timestamps VTT
        .then((response) => response.text())
        .then((text) => {
          const timestamps = parseVtt(text); // ✅ Parse VTT into JSON
          setTimestampData(timestamps);
        });
    }
  }, [timestamps_path]);
  //console.log(subtitleTracks);

  const parseTime = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds; // Convert seconds to milliseconds
  };
  console.log(
    "Redux CurrentTime:",
    currentTime,
    "| Actual Video Time:",
    videoRef.current?.currentTime
  );
  return (
    <div className="bg-gray-800 w-[49%] rounded-xl p-4 shadow-md h-full ">
      {/* Video Player */}
      <div
        className="h-full relative"
        onMouseOver={() => setShowTimestamp(true)}
        onMouseLeave={() => setShowTimestamp(false)}
      >
        <video
          ref={videoRef}
          src={previewUrl || ""}
          controls
          className="w-full h-full rounded-lg object-cover "
          onTimeUpdate={handleTimeUpdate}
        >
          {/* Add subtitle tracks */}
          {subtitleTracks.map((track, index) => {
            // Determine language code and label
            const lang = track.includes("original")
              ? language_detected // Original language
              : track.split("-").pop().split(".")[0]; // Extract language code from file name

            return (
              <track
                key={index}
                src={track}
                kind="subtitles"
                srcLang={lang}
                label={
                  lang === language_detected ? "Original" : lang.toUpperCase()
                }
                default={lang === language_detected} // Set the original language as default
              />
            );
          })}
        </video>
        {/* ✅ Absolute Timestamp Progress Bar (10px above video controls) */}
        {showTimestamp && (
          <div
            className="absolute w-[98%] bottom-[70px] timeline left-1  h-1 hover:h-2 transition-all duration-150  rounded-lg cursor-pointer "
            ref={progressBarRef}
            onClick={(e) => {
              if (videoRef.current && progressBarRef.current) {
                const rect = progressBarRef.current.getBoundingClientRect();
                const clickX = e.clientX - rect.left; // Get click position inside the bar
                const percentage = clickX / rect.width;
                videoRef.current.currentTime =
                  percentage * videoRef.current.duration; // Set video time directly
              }
            }}
          >
            {videoRef.current?.duration &&
              timestampData.map((segment, index) => {
                const totalDuration = videoRef.current?.duration || 1;
                const startPercentage =
                  (parseTime(segment.start) / totalDuration) * 100;
                const endPercentage =
                  (parseTime(segment.end) / totalDuration) * 100;
                const segmentWidth = endPercentage - startPercentage;
                const currentTimeWidth =
                  currentTime > parseTime(segment.end)
                    ? 100 // Fully red if passed
                    : currentTime > parseTime(segment.start)
                    ? ((currentTime - parseTime(segment.start)) /
                        (parseTime(segment.end) - parseTime(segment.start))) *
                      100
                    : 0;
                console.log("start: " + parseTime(segment.start));
                console.log("end: " + parseTime(segment.end));
                console.log(
                  "rotation of each segment: " +
                    (parseTime(segment.end) - parseTime(segment.start)) * 100
                );

                return (
                  <div
                    key={index}
                    className="timestamp absolute h-full bg-[#bdb9b2]  rounded-md group"
                    style={{
                      left: `${startPercentage}%`,
                      width: `${segmentWidth}%`,
                    }}
                    onClick={handleTimeUpdate}
                  >
                    <style>
                      {`
                        .timestamp:nth-child(${index + 1})::before {
                          content: "";
                          position: absolute;
                          top: 0;
                          left: 0px;
                          height: 100%;
                          background-color: #db1102;
                          transition: width 0.15s linear;
                          width: ${currentTimeWidth}%;
                          border-radius:12px
                        }
                        
                    `}
                    </style>
                    {/* ✅ Tooltip (Show on Hover) */}
                    <div className="hidden group-hover:block absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs p-1 rounded shadow-lg">
                      {segment.start} -{" "}
                      {segment.text.split(" ").slice(0, 4).join(" ") + "..."}
                    </div>
                  </div>
                );
              })}
            {/* ✅ Tracking Circle (Current Time Indicator) */}
            <div
              className="absolute line_circle bg-[#db1102] rounded-full transition-all duration-150"
              style={{
                left: `${(currentTime / videoRef.current?.duration) * 100}%`,
                width: timestampData.length === 0 && "0px",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayVideoEditor;
