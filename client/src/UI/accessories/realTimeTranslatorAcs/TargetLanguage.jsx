import { useDispatch } from "react-redux";
import { setTargetLanguageRdx } from "../../redux/selectedAudioSrc";

const TargetLanguage = () => {
  const dispatch = useDispatch();
  return (
    <div className="QPushButton mt-4 p-3 w-[230px] h-[120px] flex items-center justify-center mx-auto">
      <div className="language-selector w-[190px]">
        <label htmlFor="target-language" className="text-[14px] p-1">
          Target Language:
        </label>
        <select
          id="target-language"
          onChange={(e) => dispatch(setTargetLanguageRdx(e.target.value))}
        >
          <option value="en">English</option>
          <option value="de">German</option>
          <option value="es">Spanish</option>
          <option value="it">Italian</option>
          <option value="fr">French</option>
          <option value="tr">Turkish</option>
        </select>
      </div>
    </div>
  );
};

export default TargetLanguage;
