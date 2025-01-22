import { Link } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const MainSidebar = ({ isSidebarExpanded, toggleSidebar }) => {
  return (
    <div
      className={`${
        isSidebarExpanded ? "min-w-[150px]" : "w-[50px]"
      } bg-primary_d text-white transition-all duration-300`}
    >
      {/* Sidebar Header */}
      <div className="p-2 text-center font-semibold">
        <button
          onClick={toggleSidebar}
          className="bg-primary text-white px-2 py-1 rounded hover:bg-[#00308F] transition-all duration-200"
        >
          {isSidebarExpanded ? "➔" : "←"}
        </button>
      </div>

      {/* Sidebar Links */}
      <nav className="flex flex-col items-start text-[13px] font-bold">
        <Link
          to="/"
          className="px-4 py-2 hover:bg-[#00308F] w-full text-left transition-all duration-200"
        >
          <span>{isSidebarExpanded ? "Home" : "🏠"}</span>
        </Link>
        <Link
          to="/realtime-translator"
          className="px-4 py-2 hover:bg-[#00308F] w-full text-left transition-all duration-200"
        >
          <span>{isSidebarExpanded ? "RT Translator" : "🔊"}</span>
        </Link>
        <Link
          to="/video-subtitle-creator"
          className="px-4 py-2 hover:bg-[#00308F] w-full text-left transition-all duration-200"
        >
          <span>{isSidebarExpanded ? "Subtitle Creator" : "🎥"}</span>
        </Link>
      </nav>
    </div>
  );
};

export default MainSidebar;
