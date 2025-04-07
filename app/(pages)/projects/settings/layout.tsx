"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import { signOut } from "next-auth/react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    signOut({ redirect: true, callbackUrl: "/" });
  };
  return (
    <div className="flex flex-col bg-[#141415] h-screen w-screen md:w-auto overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#201F22]  flex justify-between items-center space-x-7">
        <h2 className="font-bold text-left font-sans text-white px-3">
          Settings
        </h2>
        <button
          onClick={handleLogout}
          className="justify-center items-center flex font-sans py-3 font-medium text-[#9E9D9F] hover:bg-white hover:text-black text-xs space-x-2 border-l border-[#272628] cursor-pointer px-3"
        >
          Log out <IoIosArrowForward />
        </button>
      </div>

      {/* Options */}
      <section className="pt-10 px-10 w-full z-10 h-full">{children}</section>

      <section className="justify-center w-full items-center flex py-3 md:py-3 bottom-0 fixed border-t border-[#28272a] px-2 md:px-0">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="justify-center items-center flex flex-wrap font-sans font-medium text-[#9E9D9F] text-xs md:text-xs gap-x-1 cursor-pointer px-1 md:px-2 p-1 rounded-md"
        >
          Curious or Have feedback? Connect with us via
          <Link
            href="https://x.com"
            className="text-white cursor-pointer hover:underline"
          >
            X
          </Link>
          or
          <Link
            href="mailto:support@uiblocks.xyz"
            className="text-white cursor-pointer hover:underline"
          >
            support@uiblocks.xyz
          </Link>
        </motion.button>
      </section>
    </div>
  );
};

export default Layout;
