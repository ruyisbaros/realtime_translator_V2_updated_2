import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  setIsTimestampsCreatedRdx,
  setTimeStampPathRdx,
} from "../../redux/videoSubtitleSlice";
const ExportVideo = () => {
  // eslint-disable-next-line no-unused-vars
  const dispatch = useDispatch();
  const { tracking_paths } = useSelector((store) => store.video_subtitles);

  // Event Handlers
  const onExportSubtitles = () => {};
  const onExportVideo = () => {};
  const onCreateTimestamps = async () => {
    // Logic to create smart timestamps with AI
    try {
      dispatch(setIsTimestampsCreatedRdx(true));
      const originalVttPath = tracking_paths.find((path) =>
        path.includes("subtitles-original.vtt")
      );
      console.log(originalVttPath);
      if (!originalVttPath) {
        console.error("Original VTT file not found!");
        return;
      }
      const { data } = await axios.post(
        "http://localhost:8000/upload/create-timestamps",
        JSON.stringify({ vtt_path: originalVttPath }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log(data);
      toast.success("Timestamps created successfully!");
      dispatch(setTimeStampPathRdx(data?.file_path));
      dispatch(setIsTimestampsCreatedRdx(false));
    } catch (error) {
      console.error("Error creating timestamps:", error);
      dispatch(setIsTimestampsCreatedRdx(false));
    }
  };
  return (
    <div className="h-[100%] w-full bg-gray-800 p-4 rounded-xl shadow-md gap-4">
      <h2 className="text-teal-400 text-xl font-semibold mb-2">
        Export & Tools
      </h2>
      <div className="flex items-center gap-4">
        <button
          className="text-[#ececec] bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500  font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200"
          onClick={onExportSubtitles}
        >
          Export Subtitles
        </button>
        <button
          className="text-[#ececec] bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500  font-semibold py-3 px-6 rounded-lg shadow-md "
          onClick={onExportVideo}
        >
          Export Video with Subtitles
        </button>
        <button
          className="text-[#ececec] bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500  font-semibold py-3 px-6 rounded-lg shadow-md "
          onClick={onCreateTimestamps}
        >
          Generate Smart Timestamps with AI
        </button>
      </div>
    </div>
  );
};

export default ExportVideo;
