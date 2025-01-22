import { useSelector } from "react-redux";
import UploadPopup from "../components/subtitleCratorComps/UploadPopup_2";
import VideoDetails from "../components/subtitleCratorComps/VideoDetails";

const VideoSubtitleCreator = () => {
  const { selectedFile, isUploadFinished } = useSelector(
    (store) => store.video_subtitles
  );
  console.log(isUploadFinished);
  return (
    <div className="h-[640px]">
      {selectedFile && isUploadFinished ? <VideoDetails /> : <UploadPopup />}
    </div>
  );
};

export default VideoSubtitleCreator;
