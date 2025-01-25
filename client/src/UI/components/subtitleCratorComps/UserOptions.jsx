import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  resetSelectedFileRdx,
  setIsUploadFinishedRdx,
  setProgressStateRdx,
} from "../../redux/videoSubtitleSlice";
import { toast } from "react-toastify";
import UploadVideoProgress from "../../accessories/subtitleCreatorAcs/uploadVideoProgress";
import { useWebSocket } from "../../WebSocketContext";

//import { uploadFileWithRetry } from "../../utils/uploader";

const UserOptions = () => {
  const dispatch = useDispatch();
  const { socket } = useWebSocket();
  const { selectedFile } = useSelector((store) => store.video_subtitles);
  const [actionType, setActionType] = useState("translation");
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [subtitleFormat, setSubtitleFormat] = useState("srt");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async () => {
    if (selectedLanguages.length === 0) {
      toast.warning("Please select at least 1 target language!");
      return;
    }
    if (!selectedFile) {
      toast.warning("No file selected!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    /* formData.append("actionType", actionType); // Add actionType
    selectedLanguages.forEach((lang) => {
      formData.append("selectedLanguages", lang);
    });
    formData.append("subtitleFormat", subtitleFormat); // Add subtitleFormat */

    try {
      setIsUploading(true);

      const response = await axios.post(
        "http://localhost:8000/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        console.log(response);
        const { file_path } = response.data;
        toast.success("Audio extraction successful!");
        // Emit the start-processing event via Socket.IO
        socket.emit("start-processing", {
          file_path,
          actionType,
          selectedLanguages,
          subtitleFormat,
        });
        dispatch(
          setProgressStateRdx({
            stage: "uploading",
            message: "Uploading completed!",
            progress: 100,
          })
        );
      } else {
        toast.warning("Audio extraction failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during upload:", error);
      toast.warning("An error occurred while extracting audio.");
    }
  };

  console.log(selectedLanguages, actionType, subtitleFormat);
  return (
    <div className="relative h-[55%] mb-2 bg-gradient-to-b from-gray-900 via-black to-gray-900 p-6 rounded-lg shadow-2xl text-gray-200 w-4/5 max-w-4xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-2 text-teal-400 font-orbitron">
        Choose Your Subtitle Preferences
      </h2>

      {/* Action Type */}
      <div className="option-group mb-2">
        <label className="text-lg font-medium mb-2 block">Action Type:</label>
        <div className="w-[50%] bg-gray-800 text-gray-200 border border-gray-700 rounded-lg p-3 flex gap-3">
          <div>
            {" "}
            <input
              type="radio"
              value="translation"
              id="translation"
              name="trans"
              defaultChecked={true}
              onChange={(e) => setActionType(e.target.value)}
              className="cursor-pointer"
            />
            <label
              htmlFor="translation"
              className="ml-3 cursor-pointer hover:text-[#30f4d6] transition-all duration-200"
            >
              Translation
            </label>
          </div>
          <div>
            {" "}
            <input
              type="radio"
              value="transcription"
              id="transcription"
              name="trans"
              onChange={(e) => setActionType(e.target.value)}
              className="cursor-pointer"
            />
            <label
              htmlFor="transcription"
              className="ml-3 cursor-pointer hover:text-[#30f4d6] transition-all duration-200"
            >
              Transcription Only
            </label>
          </div>
        </div>
      </div>
      {/* subtitle format type and language */}
      <div className="flex items-center gap-6 mt-3">
        {/* Target Language(s) */}
        <div className="option-group mb-6 w-[50%]">
          <label className="text-lg font-medium mb-2 block">
            Target Language(s):
          </label>
          <div className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-lg p-3 flex gap-3">
            <div>
              <input
                type="checkbox"
                name="english"
                id="english"
                value="en"
                disabled={actionType === "transcription"}
                onChange={(e) =>
                  setSelectedLanguages([...selectedLanguages, e.target.value])
                }
                className="selected_languages"
              />
              <label
                htmlFor="english"
                className={` ml-2 text-[14px] hover:text-[#30f4d6] transition-all duration-200 ${
                  actionType === "transcription" ? "line-through" : ""
                }`}
              >
                English
              </label>
            </div>
            <div>
              <input
                type="checkbox"
                name="german"
                id="german"
                value="de"
                disabled={actionType === "transcription"}
                onChange={(e) =>
                  setSelectedLanguages([...selectedLanguages, e.target.value])
                }
                className="selected_languages"
              />
              <label
                htmlFor="german"
                className={`ml-2 text-[14px] cursor-pointer hover:text-[#30f4d6] transition-all duration-200 ${
                  actionType === "transcription" ? "line-through" : ""
                }`}
              >
                German
              </label>
            </div>
            <div>
              <input
                type="checkbox"
                name="turkish"
                id="turkish"
                value="tr"
                disabled={actionType === "transcription"}
                onChange={(e) =>
                  setSelectedLanguages([...selectedLanguages, e.target.value])
                }
                className="selected_languages"
              />
              <label
                htmlFor="turkish"
                className={`ml-2 text-[14px] cursor-pointer hover:text-[#30f4d6] transition-all duration-200 ${
                  actionType === "transcription" ? "line-through" : ""
                }`}
              >
                Turkish
              </label>
            </div>
            <div>
              <input
                type="checkbox"
                name="spanish"
                id="spanish"
                value="es"
                disabled={actionType === "transcription"}
                onChange={(e) =>
                  setSelectedLanguages([...selectedLanguages, e.target.value])
                }
                className="selected_languages"
              />
              <label
                htmlFor="spanish"
                className={`ml-2 text-[14px] cursor-pointer hover:text-[#30f4d6] transition-all duration-200 ${
                  actionType === "transcription" ? "line-through" : ""
                }`}
              >
                Spanish
              </label>
            </div>

            {/* Add more languages as needed */}
          </div>
        </div>
        {/* Subtitle Format */}
        <div className=" mb-6 flex-grow">
          <label className="text-lg font-medium mb-2 block">
            Subtitle Format:
          </label>
          <div className="flex items-center gap-4 border border-gray-700 rounded-lg p-1">
            <label className="ml-2 text-[14px] cursor-pointer hover:text-[#30f4d6] transition-all duration-200">
              <input
                type="radio"
                name="subtitleFormat"
                value="srt"
                className="mr-2 cursor-pointer"
                onChange={() => setSubtitleFormat("srt")}
              />
              Export as .SRT
            </label>
            <label className="ml-2 text-[14px] cursor-pointer hover:text-[#30f4d6] transition-all duration-200">
              <input
                type="radio"
                name="subtitleFormat"
                value="vtt"
                className="mr-2 cursor-pointer"
                onChange={() => setSubtitleFormat("vtt")}
              />
              Export as .VTT
            </label>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="w-full flex items-center justify-center gap-6 mt-2">
        {" "}
        <button
          className="w-[35%]  bg-teal-400 hover:bg-teal-300 text-white hover:text-gray-900 font-bold py-3 rounded-lg transition-all duration-300"
          onClick={handleFileUpload}
          disabled={isUploading}
        >
          Start Processing
        </button>
        <button
          className="w-[35%]  bg-[#db1102] hover:bg-[#eb3e32] text-white hover:text-gray-900 font-bold py-3 rounded-lg transition-all duration-300"
          onClick={() => {
            dispatch(resetSelectedFileRdx());
            dispatch(setIsUploadFinishedRdx(false));
          }}
        >
          Cancel
        </button>
      </div>
      {isUploading && <UploadVideoProgress />}
    </div>
  );
};

export default UserOptions;
