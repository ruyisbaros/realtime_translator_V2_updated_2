// VideoPlayer Component
import { useState, useRef, useEffect } from "react";
import styles from "./VideoPlayer.module.css";
import { useSelector } from "react-redux";

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const subTitleRef = useRef(null);

  const { video_url } = useSelector((store) => store.video);

  const [subTitlePosition, setSubTitlePosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [isSubTitleBoxCreated, setIsSubTitleBoxCreated] = useState(false);

  const updateSubTitlePosition = () => {
    const video = videoRef.current;
    const subtitleBox = subTitleRef.current;

    if (!video || !subtitleBox) return;

    // Get video and video container positions
    const videoRect = video.getBoundingClientRect();
    //const videoParentRect = video.parentElement.getBoundingClientRect();

    // Calculate position and dimensions
    const newSubTitlePosition = {
      top: videoRect.bottom - 60,
      left: videoRect.left,
      width: videoRect.width,
      height: 60,
    };

    // Update state
    setSubTitlePosition(newSubTitlePosition);

    if (!isSubTitleBoxCreated) setIsSubTitleBoxCreated(true);
  };

  useEffect(() => {
    if (video_url && videoRef.current) {
      updateSubTitlePosition();
    }
  }, [video_url]);

  useEffect(() => {
    const handleResize = () => {
      updateSubTitlePosition();
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const subTitleStyle = {
    position: "absolute",
    top: subTitlePosition.top,
    left: subTitlePosition.left,
    width: subTitlePosition.width,
    height: subTitlePosition.height,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none", // To let clicks go through to video
  };

  return (
    <div className={styles.videoContainer}>
      <video
        ref={videoRef}
        src={video_url}
        controls
        className={styles.videoElement}
      />
      {isSubTitleBoxCreated && (
        <div
          ref={subTitleRef}
          style={subTitleStyle}
          className={styles.subTitle}
        >
          Subtitle here
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
