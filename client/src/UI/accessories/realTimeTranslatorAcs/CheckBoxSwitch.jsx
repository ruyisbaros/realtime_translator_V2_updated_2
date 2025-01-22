import { useState } from "react";
import "./styles.css";
const CheckBoxSwitch = () => {
  const [isClicked, setIsClicked] = useState(false);

  const toggleSwitch = () => {
    setIsClicked((prev) => {
      const newScanningState = !prev;
      if (newScanningState) {
        window.myAPI.volumeMute();
      } else {
        window.myAPI.volumeUnMute();
      }
      return newScanningState;
    });
  };
  return (
    <div className=" QPushButton w-[230px] h-[50px] mx-auto flex items-center justify-center mt-4">
      {isClicked ? (
        <img
          src="/assets/mic_off.svg"
          alt="mic off"
          className="shadow_c_r border-none"
        />
      ) : (
        <img
          src="/assets/mic_on.svg"
          alt="mic on"
          className="shadow_c_g border-none"
        />
      )}
      <div className="checkbox" onClick={toggleSwitch}>
        <input type="checkbox" />
        <div className="slider">
          <div className="ridges"></div>
        </div>
        <div className="light">
          <span className="font-bold text-[9px] text-[#a6f3fe]">OFF</span>
          <span className="font-bold text-[9px] text-[#a6f3fe]">ON</span>
        </div>
      </div>
      {isClicked ? (
        <div className="w-2 h-2 rounded-full bg-[#d61102] shadow_c_r"></div>
      ) : (
        <div className="w-2 h-2 rounded-full bg-[#19c4fa] shadow_c_g"></div>
      )}
    </div>
  );
};

export default CheckBoxSwitch;
