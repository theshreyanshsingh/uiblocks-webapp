"use client";

import { setMobileChatOpen } from "@/app/redux/reducers/basicData";
import { RootState } from "@/app/redux/store";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TbLayoutNavbarExpand } from "react-icons/tb";
import Messages from "./Messages";
import Palette from "./Palette";
import Keyboard from "./Keyboard";
import { LuLayoutDashboard } from "react-icons/lu";
import Image from "next/image";
import logo from "@/app/assets/logo.png";

const MobileChat = () => {
  const { MobileChatOpen } = useSelector((state: RootState) => state.basicData);
  const dispatch = useDispatch();
  const [selected, setSelected] = useState<"palette" | "ai">("ai");
  const options = ["palette", "ai"];

  return (
    <motion.div
      className="md:hidden fixed z-50 bottom-0 w-full border-t border-[#201F22] bg-[#141415] rounded-t-2xl shadow-lg"
      animate={{ y: MobileChatOpen ? 0 : "calc(100% - 40px)" }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        mass: 0.6,
      }}
    >
      <div className="flex justify-center mb-2 relative">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch(setMobileChatOpen())}
          className="text-white hover:bg-neutral-700 p-2 rounded-full shadow-md z-10"
        >
          <motion.span
            initial={false}
            animate={{ rotate: MobileChatOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center text-xl"
          >
            {MobileChatOpen ? (
              <TbLayoutNavbarExpand />
            ) : (
              <TbLayoutNavbarExpand />
            )}
          </motion.span>
        </motion.button>
      </div>

      {MobileChatOpen && (
        <div className="flex flex-col h-[70vh] w-screen bg-[#141415] border-l border-[#201F22]">
          {/* Head */}
          <div className="justify-center items-center flex p-3 bg-[#141415] border-b border-[#201F22]">
            <div className="relative flex bg-[#1A1A1A] rounded-lg px-1 py-1 w-40">
              {/* Sliding Indicator */}
              <motion.div
                layoutId="switcher"
                className="absolute top-1 bottom-1 w-1/2 bg-[#333] rounded-md"
                animate={{ x: selected === "ai" ? "100%" : "0%" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />

              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => setSelected(option as "palette" | "ai")}
                  className="relative flex-1 text-xs font-sans font-medium text-white py-1 z-10 justify-center items-center flex"
                >
                  <span className="relative z-10 flex justify-center items-center gap-x-2 ">
                    {option === "palette" ? (
                      <LuLayoutDashboard className="text-lg" />
                    ) : (
                      <Image
                        src={logo}
                        alt="Bot Logo"
                        width={14}
                        height={14}
                        className="rounded-sm"
                      />
                    )}
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Palette / Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {selected === "ai" ? (
              <div
                className="h-full"
                style={{ display: selected === "ai" ? "block" : "none" }}
              >
                <Messages />
              </div>
            ) : (
              <div
                className="h-full"
                style={{ display: selected === "palette" ? "block" : "none" }}
              >
                <Palette />
              </div>
            )}
          </div>

          {/* Input Keyboard */}
          {selected === "ai" && (
            <div className=" justify-center items-center flex flex-col ">
              <div className="p-3 border-y border-[#201F22] bg-[#1a1a1b] w-full">
                <Keyboard />
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MobileChat;
