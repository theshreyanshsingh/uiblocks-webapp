"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthenticated } from "@/app/helpers/useAuthenticated";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import AnimatedLine from "@/app/_components/AnimatedLine";
import { LuLoader } from "react-icons/lu";
import { useProject } from "@/app/helpers/useProject";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthenticated();
  const { loading } = useSelector((state: RootState) => state.projectOptions);

  // custom hook to fetch project data efficiently
  useProject();

  return (
    <div className="sm:max-md:w-full h-screen flex flex-col overflow-hidden ">
      <AnimatePresence mode="wait">
        {isAuthenticated.value && loading === "done" ? (
          <motion.div
            key="sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:flex-grow md:min-h-0"
          >
            {children}
          </motion.div>
        ) : loading === "loading" ? (
          <motion.div
            key="line"
            className="flex justify-center items-center p-10 h-[90%] mt-1"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatedLine />
          </motion.div>
        ) : loading === "error" ? (
          <motion.div
            key="line"
            className="flex justify-center items-center p-10 h-[90%] mt-1 flex-col space-y-2"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-white font-sans font-medium text-lg">
              An error occured!
            </h3>
            <p className="text-sm font-sans font-medium text-white">
              Please login again.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="line"
            className="flex justify-center items-center p-10 h-[90%] mt-1 flex-col space-y-2"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LuLoader className="text-xl text-white animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
