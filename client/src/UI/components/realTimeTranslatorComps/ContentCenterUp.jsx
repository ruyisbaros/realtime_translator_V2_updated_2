import "./styles.css";
import { useDispatch, useSelector } from "react-redux";
import {
  handleOperationStateRdx,
  setAudioChannelsRdx,
  setIsLoadingRdx,
  setSelectedSourceRdx,
} from "../../redux/selectedAudioSrc";
import { useWebSocket } from "../../WebSocketContext";
import { toast } from "react-toastify";
// eslint-disable-next-line react/prop-types
const ContentCenterUp = ({ isScanning, setIsScanning }) => {
  const dispatch = useDispatch();
  const { socket } = useWebSocket();
  const {
    operationState,
    target_language,
    source_language,
    selected_source,
    audio_channels,
  } = useSelector((store) => store.audio_src);

  const handleStateChange = (newState) => {
    if (socket) {
      socket.emit("state-change-by-react", { state: newState });
      console.log(`Emitted state change: ${newState}`);
      dispatch(handleOperationStateRdx(newState)); // Update state in Redux
    } else {
      console.warn("No state change needed or socket not connected.");
    }
  };
  const scanSources = async () => {
    try {
      const detectedSources = await window.myAPI.invoke("scan-audio-sources");

      dispatch(setAudioChannelsRdx(detectedSources));
      console.log(detectedSources);
    } catch (error) {
      console.error("Failed to scan audio sources");
      console.log(error);
    }
  };
  const handleSourceSelect = (source) => {
    if (!target_language || !source_language) {
      toast.warn("Please select a source and target language before running.");
      return;
    }

    dispatch(setSelectedSourceRdx(source)); // Update Redux state with selected source
    window.myAPI.sendAudioSource("start-operation", {
      type: "start-operation", // Ensure this is set
      id: source.id,
      mediaName: source.mediaName,
      applicationName: source.applicationName,
      source_language,
      target_language,
    }); // Send to Electron
    window.myAPI.showSubtitleWindow(); // Trigger subtitle window
    dispatch(setIsLoadingRdx(true));
    if (operationState === "idle") {
      handleStateChange("running");
      console.log("state change invoked React contextUP");
      //startOperation(source);
    }
  };
  const handleOptionClick = () => {
    setIsScanning((prev) => {
      const newScanningState = !prev;
      if (newScanningState) {
        scanSources(); // Trigger scanning
      }
      return newScanningState;
    });
  };

  return (
    <div className="QPushButton max-w-[95%] mx-auto min-h-[38%] mt-2">
      <div className="source-options">
        <button
          className={`QPushButton block mx-auto mt-4 w-[220px] h-[60px] ${
            isScanning ? "scan_now" : ""
          }`}
          onClick={() => handleOptionClick()}
          data-option="scan"
        >
          {isScanning ? (
            <span className="font-bold text-[#d61102] tracking-tight">
              Available Audio Sources
            </span>
          ) : (
            <span className="font-bold tracking-tight">Scan Audio Sources</span>
          )}
        </button>
      </div>

      {isScanning ? (
        <div className="pb-2">
          <div className="source-list-container ">
            <ul className="source-list">
              {audio_channels.length >= 1 ? (
                audio_channels.map((source, index) => (
                  <li
                    className="cursor-pointer"
                    key={index}
                    onClick={() => handleSourceSelect(source)}
                  >
                    {source.mediaName || source.name}
                  </li>
                ))
              ) : (
                <p className="text-center text-[#d61102] mt-4 font-bold">
                  No audio sources detected.
                </p>
              )}
            </ul>
            {selected_source && (
              <p>Selected Source: {selected_source?.mediaName}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="w-[88%] m-auto h-[150px] pb-2">
          <img
            src="/assets/AI-1.jpeg"
            alt="AI-1.jpeg"
            className="w-full h-full rounded-xl shadow-xl"
          />
        </div>
      )}
    </div>
  );
};

export default ContentCenterUp;
