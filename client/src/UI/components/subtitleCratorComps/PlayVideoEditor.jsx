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
  const dispatch = useDispatch();

  // Redux state
  // eslint-disable-next-line no-unused-vars
  const { previewUrl, timestamps_path, tracking_paths, language_detected } =
    useSelector((store) => store.video_subtitles);

  // Local state
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  const [timestampData, setTimestampData] = useState([]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTimeInMs = Math.floor(videoRef.current.currentTime * 1000); // Convert to milliseconds
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
  console.log(subtitleTracks);
  const parseTime = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const handleTimestampClick = (time) => {
    if (videoRef.current) {
      const [hours, minutes, seconds] = time.split(":").map(Number);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      videoRef.current.seekTo(totalSeconds, "seconds");
    }
  };

  return (
    <div className="bg-gray-800 w-[49%] rounded-xl p-4 shadow-md h-full overflow-hidden relative">
      {/* Video Player */}
      <div className="h-full relative">
        <video
          ref={videoRef}
          src={previewUrl || ""}
          controls
          className="w-full h-full rounded-lg object-cover"
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
        <div className="absolute bottom-[70px] left-6 w-[90%]  h-2 bg-gray-700/60 rounded-lg">
          {timestampData.map((segment, index) => {
            const percentage =
              (parseTime(segment.start) / videoRef.current?.duration) * 100;

            return (
              <div
                key={index}
                className="absolute bg-blue-500 h-2 w-[4px] hover:w-5 hover:h-3 transition-all duration-200 rounded-full group"
                style={{ left: `${percentage}%` }}
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = parseTime(segment.start); // ✅ Direct update (no function needed!)
                  }
                }}
              >
                {/* ✅ Tooltip: Shows on Hover */}
                <div className="hidden group-hover:block absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs p-1 rounded shadow-lg">
                  {segment.start} - {segment.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlayVideoEditor;
