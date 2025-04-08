"use client";
import { NextPage } from "next";
import React, { useState } from "react";
// import { FiGitCommit } from 'react-icons/fi';
import { LuGithub } from "react-icons/lu";
import { LuBrain } from "react-icons/lu";
// import { FaBrain } from 'react-icons/fa6';
import Switcher from "./_sub-components/Switcher";
import Shimmer from "@/app/_components/Shimmer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { setMemoryModal } from "@/app/redux/reducers/projectOptions";
import { TbChartDots3 } from "react-icons/tb";

const Header: NextPage = () => {
  const { title, memoryModal } = useSelector(
    (state: RootState) => state.projectOptions
  );
  const [share, setShare] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleShare = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setShare(true);

        setTimeout(() => {
          setShare(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err);
      });
  };

  const dispatch = useDispatch();

  return (
    <div className="w-full pl-3 flex justify-between items-center bg-[#141415] py-2 shadow-md">
      {/* Title */}
      {title ? (
        <h3 className="md:text-sm text-xs font-sans font-medium text-white truncate max-w-full overflow-hidden whitespace-nowrap">
          {title}
        </h3>
      ) : (
        <Shimmer width={"10%"} height={20} className="rounded-md" />
      )}

      {/* Action Buttons */}
      <div className="hidden items-center space-x-4 md:flex px-3">
        <Switcher />
        {/* Memory */}
        <button
          onClick={() => {
            dispatch(setMemoryModal(!memoryModal));
          }}
          className="text-sm font-sans font-medium text-white hover:bg-[#252525] p-1 rounded-lg"
        >
          <LuBrain className="text-lg" />
        </button>
        {/* Share */}
        <button
          onClick={handleShare}
          className="text-xs font-sans font-medium text-white hover:bg-[#1A1A1A] p-1 w-14 rounded-lg"
        >
          {share ? "Copied!" : "Share"}
        </button>
        {/* Connect with Git & Deploy */}
        <div className="relative group flex items-center w-fit">
          <div className="flex items-center space-x-2 rounded-lg border-[#949494] transition bg-transparent group-hover:blur-sm">
            <button className="text-white hover:text-black hover:bg-white px-2 space-x-2 rounded-lg flex justify-center items-center">
              <span className="text-xs hidden sm:inline">Connect with</span>
              <LuGithub />
            </button>
            <button className="text-black bg-white hover:bg-gray-200 px-2 rounded-lg">
              <span className="text-xs hidden sm:inline">Deploy</span>
            </button>
          </div>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-sans font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
            Available soon
          </span>
        </div>
        {/* resizer */}
        {/* <button
          onClick={toggleSidebar}
          className="text-white hover:bg-[#252525] transition-colors cursor-pointer mr-3 p-1 rounded-lg justify-center items-center flex"
        >
          <BsLayoutSidebar />
        </button> */}
      </div>

      {/* Mobile Action buttons */}
      <div className="md:hidden items-center space-x-2  flex ">
        <Switcher />
        {/* Share */}
        <button
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
          }}
          className="text-sm font-sans font-medium text-white hover:bg-[#252525] px-3 rounded-lg"
        >
          <TbChartDots3 className="text-lg" />
        </button>
      </div>
      {dropdownOpen && (
        <div className="md:hidden absolute right-1 top-22 mt-2 w-30 bg-[#1A1A1A] rounded-md shadow-lg z-10 border border-[#252525]">
          <button
            onClick={() => {
              dispatch(setMemoryModal(!memoryModal));
              setDropdownOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-[#252525]"
          >
            Memory
          </button>
          <button
            onClick={() => {
              handleShare();
              setDropdownOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-[#252525]"
          >
            Share
          </button>
        </div>
      )}
    </div>
  );
};

export default Header;
