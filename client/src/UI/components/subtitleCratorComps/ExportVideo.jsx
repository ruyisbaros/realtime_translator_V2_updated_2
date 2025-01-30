import { useSelector } from "react-redux";
import GenerateTimestamps from "../../accessories/subtitleCreatorAcs/GenerateTimestamps";
import ExportContents from "../../accessories/subtitleCreatorAcs/ExportContents";

const ExportVideo = () => {
  const { timestamps_path } = useSelector((store) => store.video_subtitles);
  return (
    <div className="h-[100%] w-full bg-gray-800 p-2 rounded-xl shadow-md gap-4">
      {timestamps_path ? <ExportContents /> : <GenerateTimestamps />}
    </div>
  );
};

export default ExportVideo;
