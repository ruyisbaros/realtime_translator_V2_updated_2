import { useDispatch } from "react-redux";
import { setSourceLanguageRdx } from "../../redux/selectedAudioSrc";

const SourceLanguage = () => {
  const dispatch = useDispatch();

  return (
    <div className="QPushButton mt-4 p-3 w-[230px] h-[120px] flex items-center justify-center mx-auto">
      <div className="language-selector w-[190px]">
        <label htmlFor="source-language" className="text-[14px] p-1">
          Source Language:
        </label>
        <select
          id="source-language"
          onChange={(e) => dispatch(setSourceLanguageRdx(e.target.value))}
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

export default SourceLanguage;
