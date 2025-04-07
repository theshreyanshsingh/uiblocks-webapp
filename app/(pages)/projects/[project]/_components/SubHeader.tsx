"use client";
import { NextPage } from "next";
import React from "react";
import { RiRefreshLine, RiFullscreenExitLine } from "react-icons/ri";
import { BiFullscreen } from "react-icons/bi";
import { CiMobile1, CiLaptop } from "react-icons/ci";
import { useSandpack } from "@codesandbox/sandpack-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import {
  setFullscreen,
  setResponsivess,
} from "@/app/redux/reducers/projectOptions";

// const dropdownVariants = {
//   hidden: { opacity: 0, scale: 0.95, y: -5 },
//   visible: { opacity: 1, scale: 1, y: 0 },
// };

const SubHeader: NextPage = () => {
  const { fullscreen, responsive } = useSelector(
    (state: RootState) => state.projectOptions
  );
  const reduxDispatch = useDispatch();
  // const [selectedView, setSelectedView] = useState<string>('/Index');
  // const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const { dispatch } = useSandpack();
  const handleRefresh = () => {
    dispatch({ type: "refresh" });
  };

  //needs fix
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      reduxDispatch(setFullscreen({ fullscreen: true }));
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`
        );
      });
    } else {
      reduxDispatch(setFullscreen({ fullscreen: false }));
      document.exitFullscreen();
    }
  };

  return (
    <div className="w-full p-2 flex justify-between items-center bg-[#0e0e0f] shadow-md space-x-5">
      <button
        onClick={handleRefresh}
        className="flex items-center cursor-pointer text-sm text-white"
      >
        <RiRefreshLine />
      </button>

      {/* Custom Full-Width Dropdown */}
      {/* <div className="relative flex-1 mx-2">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full bg-[#1c1c1d] border border-[#2a2a2b] text-xs font-medium font-mono rounded-md p-1.5 text-white text-center"
        >
          {selectedView}
        </button>
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={dropdownVariants}
              transition={{ duration: 0.2 }}
              className="absolute left-0 mt-1 w-full bg-[#1c1c1d] border border-[#2a2a2b] rounded-md shadow-lg z-10"
            >
              <button
                onClick={() => {
                  setSelectedView('/Index');
                  setDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-[#2a2a2b] text-xs"
              >
                /Index
              </button>
              <button
                onClick={() => {
                  setSelectedView('/Coding');
                  setDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-[#2a2a2b] text-xs"
              >
                /Coding
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div> */}

      {/* Fullscreen & Device Toggle */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => {
            if (responsive === "desktop") {
              reduxDispatch(setResponsivess({ responsive: "mobile" }));
            } else {
              reduxDispatch(setResponsivess({ responsive: "desktop" }));
            }
          }}
          className="flex items-center cursor-pointer text-white text-sm"
        >
          {responsive === "mobile" ? (
            <CiLaptop className="text-lg" />
          ) : (
            <CiMobile1 className="text-lg" />
          )}
        </button>
        <button
          onClick={() => {
            if (fullscreen) {
              toggleFullscreen();
            } else {
              toggleFullscreen();
            }
          }}
          className="flex items-center cursor-pointer text-white text-sm mx-1"
        >
          {fullscreen ? (
            <RiFullscreenExitLine className="text-lg" />
          ) : (
            <BiFullscreen className="text-lg" />
          )}
        </button>
      </div>
    </div>
  );
};

export default SubHeader;
