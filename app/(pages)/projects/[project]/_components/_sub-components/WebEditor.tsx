"use client";

import { NextPage } from "next";
import React, { useEffect, useCallback, useRef, useState } from "react";
import {
  SandpackCodeEditor,
  SandpackFileExplorer,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useDispatch } from "react-redux";
import { setprojectData } from "@/app/redux/reducers/projectFiles";
import { saveProject } from "@/app/_services/projects";
import { useAuthenticated } from "@/app/helpers/useAuthenticated";
import { usePathname } from "next/navigation";
import { RiCommandLine } from "react-icons/ri";
import { AnimatePresence, motion } from "framer-motion";

// Save status constants
const SAVE_STATUS = {
  SAVED: "SAVED",
  EDITED: "EDITED",
  INITIAL: "INITIAL",
};

const WebEditor: NextPage = () => {
  // Use the correct hooks for Sandpack
  const { sandpack } = useSandpack();
  const dispatch = useDispatch();
  const { email } = useAuthenticated();
  const path = usePathname();
  const projectId = path.split("/")[2] || "";
  const [showExplorer, setShowExplorer] = useState(false);
  // Use refs to track state without triggering re-renders
  const saveStatusRef = useRef(SAVE_STATUS.INITIAL);
  const previousFilesRef = useRef({});

  // State for UI updates only
  const [saveStatusUI, setSaveStatusUI] = useState(SAVE_STATUS.INITIAL);

  // Check for file changes
  useEffect(() => {
    if (!sandpack || !sandpack.files) return;

    const currentFilesString = JSON.stringify(sandpack.files);
    const previousFilesString = JSON.stringify(previousFilesRef.current);

    if (
      previousFilesString !== currentFilesString &&
      Object.keys(previousFilesRef.current).length > 0
    ) {
      // Files have changed
      saveStatusRef.current = SAVE_STATUS.EDITED;
      setSaveStatusUI(SAVE_STATUS.EDITED);
    }

    // Update previous files reference
    previousFilesRef.current = { ...sandpack.files };
  }, [sandpack.files, sandpack.activeFile]);

  // Initialize previous files on first load
  useEffect(() => {
    if (
      sandpack &&
      sandpack.files &&
      Object.keys(previousFilesRef.current).length === 0
    ) {
      previousFilesRef.current = { ...sandpack.files };
    }
  }, [sandpack]);

  function getOS() {
    return typeof window !== "undefined" &&
      window.navigator.platform.toLowerCase().includes("mac")
      ? "mac"
      : "windows";
  }

  // Handle Save
  const handleSave = useCallback(async () => {
    if (
      saveStatusRef.current === SAVE_STATUS.SAVED ||
      !sandpack ||
      !sandpack.files
    )
      return;

    try {
      // Update refs and UI
      saveStatusRef.current = SAVE_STATUS.SAVED;
      setSaveStatusUI(SAVE_STATUS.SAVED);

      await saveProject({
        data: JSON.stringify(sandpack.files),
        projectId,
        email: email.value || "",
      });

      dispatch(setprojectData({ ...sandpack.files }));

      // Update previous files after save
      previousFilesRef.current = { ...sandpack.files };

      // Reset save status after 3 seconds
      setTimeout(() => {
        // Only reset UI if there were no changes during the timeout
        if (saveStatusRef.current === SAVE_STATUS.SAVED) {
          setSaveStatusUI(SAVE_STATUS.INITIAL);
        }
      }, 1500);
    } catch (error) {
      console.error("Error saving:", error);
      saveStatusRef.current = SAVE_STATUS.EDITED;
      setSaveStatusUI(SAVE_STATUS.EDITED);
    }
  }, [projectId, email, sandpack]);

  // Listen for Cmd + S or Ctrl + S to Save
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  return (
    <div className="flex-grow h-full overflow-hidden flex flex-col bg-[#151515]">
      {/* Header with Save Status */}
      <div className=" justify-end items-center flex border-b border-[#201f22] mx-1">
        <button
          onClick={handleSave}
          className="flex items-center px-2 p-1 rounded-lg text-xs font-medium text-[#5B5B5B]"
        >
          {saveStatusUI === SAVE_STATUS.SAVED ? (
            "Saved"
          ) : saveStatusUI === SAVE_STATUS.EDITED ? (
            "Edited"
          ) : (
            <div className="flex items-center gap-x-2 text-white">
              Press
              <div className="max-md:hidden flex items-center gap-x-2">
                {getOS() === "mac" ? <RiCommandLine /> : "Ctrl"} {" + "}{" "}
                <span>S</span>
              </div>
              <div className="md:hidden flex items-center gap-x-2">to Save</div>
            </div>
          )}
        </button>

        {/* Toggle Explorer Button */}
        <button
          onClick={() => setShowExplorer((prev) => !prev)}
          className="text-xs text-white ml-4 border-l border-[#2a2a2a] px-2 py-1  hover:bg-[#1f1f1f] transition w-[100px]"
        >
          {showExplorer ? "Hide Files" : "Show Files"}
        </button>
      </div>

      {/* Code Editor */}
      <SandpackCodeEditor
        initMode="user-visible"
        showRunButton={false}
        showInlineErrors
        showLineNumbers
        showTabs={false}
        className="h-[97%] rounded-none z-10"
      />

      {/* File Explorer - toggled */}
      <AnimatePresence>
        {showExplorer && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="absolute bottom-0 left-0 right-0 z-50 border-t border-[#201F22] bg-[#1A1A1A] rounded-t-lg shadow-lg overflow-hidden"
          >
            {/* Optional Frame Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#2A2A2A] bg-[#121212]">
              <span className="text-xs font-sans font-medium text-white uppercase tracking-wider">
                File Explorer
              </span>
              <button
                onClick={() => setShowExplorer(false)}
                className="text-xs text-[#AAAAAA] hover:text-white transition"
              >
                Close
              </button>
            </div>

            {/* Explorer Content */}
            <div className="max-h-[300px] overflow-y-auto">
              <SandpackFileExplorer className="w-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WebEditor;
