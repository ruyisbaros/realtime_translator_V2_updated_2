import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentTimeRdx } from "../../redux/videoSubtitleSlice";
import { convertPathsToUrls } from "../../utils/read_json";
import "./subtitleStyles.css";

const PlayVideoEditor = () => {
  const videoRef = useRef();
  const dispatch = useDispatch();

  // Redux state
  // eslint-disable-next-line no-unused-vars
  const { previewUrl, currentTime, tracking_paths } = useSelector(
    (store) => store.video_subtitles
  );

  // Local state
  const [subtitleTracks, setSubtitleTracks] = useState([]);

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
  console.log(subtitleTracks);

  return (
    <div className="bg-gray-800 w-[49%] rounded-xl p-4 shadow-md h-full overflow-hidden relative">
      {/* Video Player */}
      <div className="h-full relative">
        <video
          ref={videoRef}
          src={previewUrl || ""}
          controls
          className="w-full h-full rounded-lg object-cover"
        >
          {/* Add subtitle tracks */}
          {subtitleTracks.map((track, index) => {
            // Determine language code and label
            const lang = track.includes("original")
              ? "de" // Original language
              : track.split("-").pop().split(".")[0]; // Extract language code from file name

            return (
              <track
                key={index}
                src={track}
                kind="subtitles"
                srcLang={lang}
                label={lang === "de" ? "Original" : lang.toUpperCase()}
                default={lang === "de"} // Set the original language as default
              />
            );
          })}
        </video>
      </div>
    </div>
  );
};

export default PlayVideoEditor;
