import { useState } from "react";
import "./styles.css";
const NoisyEnv = () => {
  const [isClicked, setIsClicked] = useState(false);

  return (
    <div className="flex items-center justify-center mt-4 w-[230px] mx-auto">
      <div className="checkbox-container ">
        <input
          type="checkbox"
          id="noisy-environment"
          className="hidden-checkbox"
          onChange={() => setIsClicked((prev) => !prev)}
        />
        {isClicked ? (
          <label
            htmlFor="noisy-environment"
            className="custom-checkbox the_text_shadow"
          >
            <span className="checkbox-slider the_text_shadow"></span>
            Noisy
          </label>
        ) : (
          <label
            htmlFor="noisy-environment"
            className="custom-checkbox the_text_shadow"
          >
            <span className="checkbox-slider "></span>
            Noiseless
          </label>
        )}
      </div>
    </div>
  );
};

export default NoisyEnv;
