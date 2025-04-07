"use client";
import { setReaderMode } from "@/app/redux/reducers/projectOptions";
import { AppDispatch, RootState } from "@/app/redux/store";
import React, { useEffect, useState } from "react";
import { CiViewTimeline } from "react-icons/ci";
import { GoCodeOfConduct } from "react-icons/go";
import { LuBrain, LuLoaderCircle } from "react-icons/lu";
import { MdOutlineUpload } from "react-icons/md";
import { SiModal } from "react-icons/si";
import { TiFlashOutline, TiPen } from "react-icons/ti";
import { useDispatch, useSelector } from "react-redux";
import StreamedDataDisplay from "./StreamDataDisplay";
import { AnimatePresence, motion } from "framer-motion";
import { IoIosArrowForward } from "react-icons/io";

const items = [
  {
    text: "Upload media as a Reference",
    icon: <MdOutlineUpload className="text-lg text-white" />,
  },
  {
    text: "A Persistent memory",
    icon: <LuBrain className="text-lg text-white" />,
  },
  {
    text: "Generate variants of a component with palette",
    icon: <TiPen className="text-lg text-white" />,
  },
  {
    text: "Invite your team and collaborate in Realtime (soon)",
    icon: <TiFlashOutline className="text-lg text-white" />,
  },
  {
    text: "Select the model you prefer (soon)",
    icon: <SiModal className="text-xl text-white" />,
  },
  {
    text: "Import code from git or bring from your desktop",
    icon: <GoCodeOfConduct className="text-lg text-white" />,
  },
  {
    text: "Preview your changes right on the spot",
    icon: <CiViewTimeline className="text-lg text-white" />,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    // Accept custom delay if needed
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Stagger delay for icon and text container
      delayChildren: 0.1 * i, // Optional delay for the whole container entrance
    },
  }),
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05, // Stagger children on exit too
      staggerDirection: -1, // Reverse stagger on exit
    },
  },
};

const iconVariants = {
  hidden: { scale: 0.5, opacity: 0, y: 10 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
    },
  },
  exit: {
    scale: 0.5,
    opacity: 0,
    y: 10,
    transition: { duration: 0.2 },
  },
};
const textContainerVariants = {
  hidden: {}, // No specific style needed here, relies on parent
  visible: {
    transition: {
      staggerChildren: 0.05, // Stagger delay between words
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03, // Faster stagger on exit
      staggerDirection: -1,
    },
  },
};

// Variants for each word
const wordVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 12,
    },
  },
  exit: {
    opacity: 0,
    y: -10, // Move up slightly on exit
    transition: { duration: 0.15 },
  },
};

const Thoughts = () => {
  const [index, setIndex] = useState(0);
  const dispatch = useDispatch<AppDispatch>();

  const handleRead = () => {
    dispatch(setReaderMode(true));
  };

  const { generating, readerMode } = useSelector(
    (state: RootState) => state.projectOptions
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 2500); // Change item every 2.5 seconds

    return () => clearInterval(interval);
  }, []);
  const currentItem = items[index];
  const words = currentItem.text.split(" ");

  return (
    <div className="flex-grow w-full h-full overflow-hidden relative px-3">
      {generating && readerMode ? (
        <StreamedDataDisplay />
      ) : (
        <>
          <p className="absolute transform -translate-1/2 left-1/2 top-[40vh] max-md:top-[35vh] text-xl font-sans font-medium text-white flex gap-x-2 justify-center items-center">
            Building
            <LuLoaderCircle className="text-lg text-white animate-spin" />
          </p>
          <div className="h-10 relative overflow-hidden w-full max-w-xs sm:max-w-sm md:max-w-md transform -translate-1/2 left-1/2 top-1/2 ">
            {/* Container to manage height and clipping */}
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                className="flex items-center justify-center text-white text-sm space-x-2" // Use space-x for spacing
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Animated Icon */}
                <motion.span variants={iconVariants}>
                  {currentItem.icon}
                </motion.span>

                {/* Animated Text (Word by Word) */}
                <motion.div className="flex" variants={textContainerVariants}>
                  {words.map((word, i) => (
                    <motion.span
                      key={word + i} // Unique key for each word span
                      variants={wordVariants}
                      className="text-sm font-sans font-medium text-white"
                      style={{
                        display: "inline-block",
                        marginRight: "4px",
                      }} // inline-block needed for y transform
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
          <button
            onClick={handleRead}
            className="animate-pulse cursor-pointer px-3 p-1 bg-[#0F0F0F] rounded-lg justify-center items-center flex text-white font-sans font-medium text-sm gap-x-2 absolute transform -translate-1/2 left-1/2 top-[53vh]"
          >
            See what i am doing <IoIosArrowForward />
          </button>
        </>
      )}
    </div>
  );
};

export default Thoughts;
