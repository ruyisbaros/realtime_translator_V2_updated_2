import { useState } from "react";
import "./styles.css";
const SaveUnSave = () => {
  const [isClicked, setIsClicked] = useState(false);
  const toggleSwitch = () => {
    setIsClicked((prev) => !prev);
  };

  const iconStyle = { color: isClicked ? "white" : "#d61102" };
  return (
    <div className="w-[230px] h-[50px] mx-auto mt-4 flex items-center justify-center gap-4 QPushButton">
      <div className="buttons">
        <label>
          <input type="checkbox" name="check" onChange={toggleSwitch} />
          <span></span>
          <i className="fa-solid fa-floppy-disk" style={iconStyle}></i>
        </label>
      </div>
      {isClicked ? (
        <span className="the_text_shadow_un text-[#ececec]">Save</span>
      ) : (
        <span className="the_text_shadow_un text-[#d61102]">Un Save</span>
      )}
    </div>
  );
};

export default SaveUnSave;
