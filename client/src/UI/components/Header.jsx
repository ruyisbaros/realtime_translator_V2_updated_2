import { useState } from "react";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };
  return (
    <header className="header flex items-center justify-between bg-primary p-4 text-white mt-[-25px]">
      {/* Left: Logo and Title */}
      <div className="flex items-center space-x-3">
        <img
          src="/assets/logo_3.png"
          alt="Logo"
          className="h-10 w-10 rounded-full cursor-pointer"
          style={{ WebkitAppRegion: "no-drag" }}
        />
        <div>
          <h1 className="text-[22px] font-orbitron">Beyond Language</h1>
          <p className="text-[12px] italic font-bold text-[#ececec]">
            Breaking barriers, one word at a time...
          </p>
        </div>
      </div>

      {/* Right: Profile and Window Controls */}
      <div className="flex items-center space-x-4 gap-6">
        {/* Profile Picture with Dropdown */}
        <div className="relative">
          <img
            src="/assets/prof_1.jpg"
            alt="Profile"
            className="h-10 w-10 rounded-full cursor-pointer"
            onClick={toggleDropdown}
            style={{ WebkitAppRegion: "no-drag" }}
          />
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg text-black"
              style={{ WebkitAppRegion: "no-drag" }}
            >
              <ul className="py-1">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Profile
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Settings
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Window Controls */}
        <div className="flex items-center space-x-2 gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.myAPI.minimizeWindow()}
              className="w-[25px] h-[25px] hover:text-white bg-primary p-1 rounded-full flex items-center justify-center text-[14px] hover:bg-blue-800 transition-all duration-150 font-bold"
              style={{ WebkitAppRegion: "no-drag" }}
            >
              —
            </button>
            <button
              onClick={() => window.myAPI.closeWindow()}
              className="w-[25px] h-[25px] hover:text-white bg-primary p-1 rounded-full flex items-center justify-center text-[14px] hover:bg-red-700 transition-all duration-150 font-bold"
              style={{ WebkitAppRegion: "no-drag" }}
            >
              X
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
