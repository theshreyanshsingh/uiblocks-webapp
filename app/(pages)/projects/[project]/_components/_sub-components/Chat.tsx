"use client";

import { NextPage } from "next";
import React, { useState } from "react";
import Messages from "./Messages";
import Keyboard from "./Keyboard";
import { motion } from "framer-motion";
import { LuLayoutDashboard } from "react-icons/lu";
import Image from "next/image";
import logo from "@/app/assets/logo.png";
import Palette from "./Palette";

const Chat: NextPage = () => {
  const [selected, setSelected] = useState<"palette" | "ai">("ai");
  const options = ["palette", "ai"];

  return (
    <div className="md:flex flex-col hidden h-screen w-[20vw] bg-[#0F0F0F] border-l border-[#201F22]">
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
  );
};

export default Chat;
