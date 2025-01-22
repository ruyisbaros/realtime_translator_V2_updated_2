import { useSelector } from "react-redux";

const RightSidebar = () => {
  const { same_language_warning, no_voice_detected, display_warning_box } =
    useSelector((store) => store.audio_src);
  console.log(same_language_warning);
  return (
    <div className="bg-primary rounded-[10px] w-[29%]">
      <div className="w-full  h-[640px] rounded-[5px] text-white QPushButton">
        <div className="w-full h-[230px] p-2">
          <img
            src="/assets/jarvis.gif"
            alt=""
            className="w-full h-full rounded-xl"
          />
        </div>
        <div className="w-full h-[230px] p-2">
          <img
            src="/assets/signal_1.gif"
            alt=""
            className="w-full h-full rounded-xl"
          />
        </div>
        {display_warning_box && (
          <div className="p-2 warning-area w-full h-[100px]">
            <h2 className="text-center font-bold text-[#db1102] ">
              Warning Box
            </h2>

            {same_language_warning && (
              <p className="text-center font-bold text-[#db1102] mb-2">
                Same Language Detected
              </p>
            )}
            <hr></hr>
            {no_voice_detected && (
              <p className="text-center font-bold text-[#db1102] mt-2">
                No Voice Detected
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
