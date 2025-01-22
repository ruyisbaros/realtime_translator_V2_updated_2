import { useRef, useState } from "react";
import "./styles.css";
const VoiceControl = () => {
  const rangeRef = useRef(null);

  const [sliderValue, setSliderValue] = useState(50); // Initialize state

  const handleChange = (e) => {
    const newVolume = parseInt(e.target.value, 10);
    setSliderValue(newVolume); // Update state
    if (rangeRef.current) {
      rangeRef.current.textContent = newVolume; // Update the displayed value
    }
    window.myAPI.setVolume(newVolume);
  };
  const sliderStyle = {
    background: `linear-gradient(to right, hsl(224, 48%, 36%) ${sliderValue}%, rgb(214,214,214) ${sliderValue}%)`,
  };
  return (
    <div className="h-[50px] w-[230px] flex items-center justify-center mx-auto mt-4 QPushButton">
      <div className="slide_container flex items-center gap-2 px-3">
        {sliderValue <= 0 ? (
          <img
            src="/assets/voice_stop.svg"
            alt="speaker on"
            className="inline-block w-6 h-6"
          />
        ) : (
          <img
            src="/assets/voice_start.svg"
            alt="speaker on"
            className="inline-block w-6 h-6"
          />
        )}
        <input
          ref={rangeRef}
          type="range"
          name="slider"
          id="my_range"
          min={0}
          max={99}
          value={sliderValue} // Bind value to state
          onChange={handleChange} // Handle changes
          className="voice_slider w-[170px] cursor-grabbing h-[10px]"
          style={sliderStyle} // Apply gradient style to slider
        />
        <p className="val_p text-[11px] font-bold">{sliderValue}%</p>
      </div>
    </div>
  );
};

export default VoiceControl;
