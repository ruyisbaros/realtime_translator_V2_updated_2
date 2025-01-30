import { useEffect, useState } from "react";
import { motivationalTexts, images } from "./contstants";

const TimestampProgress = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const message = "Timestamps have been created...";

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 h-[750px] bg-gradient-to-b from-black via-[#0a192f] to-black bg-opacity-80 flex items-center justify-center rounded-xl z-50 backdrop-blur-lg">
      <div className="w-[85%] h-[85%] bg-[#0d1b2a] text-white shadow-2xl rounded-xl flex flex-col items-center justify-center text-center p-6 border border-gray-600 relative">
        {/* 🔥 Neon Glow Effect */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#ff006e] h-1 w-40 blur-sm" />
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#ffbe0b] h-1 w-40 blur-sm" />

        {/* ✅ Image + Text Container */}
        <div className="flex flex-col items-center justify-center w-full h-full">
          {/* ✅ Smooth Image Transition */}
          <img
            src={images[currentImageIndex]}
            alt="Timestamps improve engagement"
            className="w-[70%] h-[70%] mb-4 rounded-lg shadow-2xl transition-opacity duration-700 bg-contain"
          />

          {/* ✅ Motivational Text (Syncs with Image) */}
          <h2 className="text-3xl font-bold text-[#ffbe0b] mb-2 drop-shadow-lg">
            {motivationalTexts[currentImageIndex].title}
          </h2>
          <p className="text-lg text-gray-300 px-10">
            {motivationalTexts[currentImageIndex].description}
          </p>
          <p className="text-md text-gray-400 italic mt-4">
            {motivationalTexts[currentImageIndex].quote}
          </p>
          <p className="text-xl text-[#ffbe0b] mt-6 tracking-wider fadeInOutAnimation">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimestampProgress;
