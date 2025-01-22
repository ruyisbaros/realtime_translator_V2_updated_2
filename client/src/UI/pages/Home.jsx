import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(path); // Navigate to the specified route
  };
  return (
    <div
      className="relative h-screen flex flex-col items-center justify-center bg-cover bg-center m-1 rounded-xl shadow-xl"
      style={{
        backgroundImage: `url('/assets/background-2.webp')`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#031649] opacity-[0.8] rounded-xl"></div>

      {/* Main Content */}
      <div className="relative z-10 text-center shadow-2xl">
        <h1 className="text-5xl font-bold text-[#ececec] drop-shadow-md mb-6 font-orbitron">
          Beyond Language
        </h1>
        <p className="text-lg text-[#30f4d6] max-w-2xl mx-auto mb-12 font-orbitron">
          Experience the future of communication. Whether in real-time or with
          video subtitles, our API breaks down language barriers, offering a
          seamless translation experience tailored to your needs.
        </p>
        <div className="flex items-center justify-center gap-6">
          {/* Realtime Translator */}
          <button
            onClick={() => navigateTo("/realtime-translator")}
            className="px-6 py-3 bg-[#031649] hover:bg-[#040814] text-[#ececec] rounded-md text-lg transition duration-300 ease-in-out shadow-md font-orbitron"
          >
            Realtime Translator
          </button>
          {/* Video Subtitle Creator */}
          <button
            onClick={() => navigateTo("/video-subtitle-creator")}
            className="px-6 py-3 bg-[#031649] hover:bg-[#040814] text-[#ececec] rounded-md text-lg transition duration-300 ease-in-out shadow-md font-orbitron"
          >
            Video Subtitle Creator
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
