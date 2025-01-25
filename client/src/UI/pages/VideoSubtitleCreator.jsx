import { useDispatch, useSelector } from "react-redux";
import UploadPopup from "../components/subtitleCratorComps/UploadPopup_2";
import VideoDetails from "../components/subtitleCratorComps/VideoDetails";
import { useEffect } from "react";
import { setActiveAppRdx } from "../redux/activeAppSlicer";
import { useWebSocket } from "../WebSocketContext";
import VideoEditor from "../components/subtitleCratorComps/VideoEditor";

const VideoSubtitleCreator = () => {
  const dispatch = useDispatch();
  const { active_app } = useSelector((store) => store.activeApp);
  const { socket } = useWebSocket();
  const { selectedFile, isUploadFinished, isTranslationComplete } = useSelector(
    (store) => store.video_subtitles
  );

  /*   useEffect(() => {
    if (active_app !== "subtitle-creator") {
      dispatch(setActiveAppRdx("subtitle-creator"));
    }
    socket.emit("define-active-app", { active_app: "subtitle-creator" });
  }, [dispatch, active_app, socket]); */
  return (
    <div className="h-[640px]">
      {!isTranslationComplete ? (
        selectedFile && isUploadFinished ? (
          <VideoDetails />
        ) : (
          <UploadPopup />
        )
      ) : (
        <VideoEditor />
      )}
    </div>
  );
};

export default VideoSubtitleCreator;
