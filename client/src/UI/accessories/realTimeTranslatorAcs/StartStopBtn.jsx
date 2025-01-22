// In Header Component
import { useDispatch } from "react-redux";
import {
  setSelectedSourceRdx,
  setSourceLanguageRdx,
  setTargetLanguageRdx,
} from "../../redux/selectedAudioSrc";
import "./styles.css";
import { toast } from "react-toastify";
import ConfirmationModal from "./ConfirmationModal";
import { useState } from "react";
// eslint-disable-next-line react/prop-types
const StartStopBtn = ({ setIsScanning }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const dispatch = useDispatch();

  const handleButtonClick = () => {
    setIsPaused((prev) => {
      const newScanningState = !prev;
      if (newScanningState) {
        window.myAPI.playMedia();
      } else {
        window.myAPI.pauseMedia();
      }
      return newScanningState;
    });
  };
  //MODAL
  const handleConfirmStop = () => {
    setIsModalOpen(false); // Close modal
    dispatch(setSelectedSourceRdx(null));
    dispatch(setTargetLanguageRdx("en"));
    dispatch(setSourceLanguageRdx("en"));

    setIsScanning(false);
    window.myAPI.closeSubtitleWindow();
    toast.info("Operation reset. Please select a new source to continue.");
  };
  const stopOperation = () => {
    setIsModalOpen(true); // Open modal
  };

  const handleCancelStop = () => {
    setIsModalOpen(false); // Close modal
    console.log("User canceled stop operation.");
  };

  return (
    <div
      className={`w-[230px] h-[50px] mx-auto flex items-center justify-center mt-4 relative gap-3`}
    >
      <button
        className={`translationButton ${
          !isPaused ? "translationButton_clicked" : ""
        }`}
        onClick={() => {
          handleButtonClick();
        }}
      >
        {!isPaused ? (
          <>
            <img src="/assets/pause.svg" alt="Public on" className="" />
            <span className="pl-2 text-[14px] text-[#e45348] font-bold tracking-tight">
              Pause
            </span>
          </>
        ) : (
          <>
            {" "}
            <img src="/assets/public_on.svg" alt="Public off" className="" />
            <span className="pl-2 text-[14px] text-[#30f4d6] font-bold tracking-tight">
              Resume
            </span>
          </>
        )}
      </button>
      <div>
        <button
          className="translationButton stop_btn relative"
          onClick={stopOperation}
        >
          <img src="/assets/public_off.svg" alt="Public on" className="" />
          <span className="pl-2 text-[14px] text-[#d61102] font-bold tracking-tight">
            Stop
          </span>
        </button>
        <ConfirmationModal
          isOpen={isModalOpen}
          onConfirm={handleConfirmStop}
          onCancel={handleCancelStop}
        />
      </div>
    </div>
  );
};

export default StartStopBtn;
