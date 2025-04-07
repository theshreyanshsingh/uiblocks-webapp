"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Spotlight } from "./Spotlight";
import Header from "./Header";
import { motion } from "framer-motion";
import AttachmentPreview from "./AttachmentPreview";
import { FaArrowRight, FaPaperclip } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import {
  addImage,
  addImageURL,
  removeImage,
  removeImageURL,
  setLoginModalOpen,
  setPricingModalOpen,
} from "../redux/reducers/basicData";
import { useAuthenticated } from "../helpers/useAuthenticated";
import { useRouter } from "next/navigation";
import { LuLoaderCircle } from "react-icons/lu";

import { setGenerating } from "../redux/reducers/projectOptions";
import { API } from "../config/Config";
import { setNotification } from "../redux/reducers/NotificationModalReducer";
import { BsLightningChargeFill } from "react-icons/bs";
import { useSubscriptionCheck } from "../helpers/useSubscriptionCheck";

const Hero = () => {
  const [input, setInput] = useState("");
  const [framework, setFramework] = useState("React");
  const [cssLibrary, setCssLibrary] = useState("Tailwind CSS");
  const [memory, setMemory] = useState("");

  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const [attachments, setAttachments] = useState<
    Array<{
      file: File;
      preview: string;
      type: "image";
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const checkRef = useRef<boolean>(false);

  const { isAuthenticated, email } = useAuthenticated();

  const { needsUpgrade, checkSubscriptionStatus } = useSubscriptionCheck({
    isAuthenticated: isAuthenticated.value,
    email: email?.value || "",
  });

  const dispatch = useDispatch();
  const router = useRouter();
  const mainContentVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.2, delay: 0.2 } },
  };

  const inputBoxVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.2, delay: 0.3 } },
  };

  const buttonHoverVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  const typewriterTexts = [
    "Build a Paint App...",
    "Create a Chess Game...",
    "Develop a Blog Website...",
    "Design a Music Player...",
    "Make a Chat app...",
  ];

  useEffect(() => {
    const currentText = typewriterTexts[textIndex];

    const typingSpeed = isDeleting ? 50 : 100; // Faster delete speed
    const nextCharIndex = isDeleting ? charIndex - 1 : charIndex + 1;

    const updateText = () => {
      setPlaceholder(currentText.substring(0, nextCharIndex));

      if (!isDeleting && nextCharIndex === currentText.length) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && nextCharIndex === 0) {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % typewriterTexts.length);
      }
      setCharIndex(nextCharIndex);
    };

    const timeout = setTimeout(updateText, typingSpeed);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex]);

  const handleAttachClick = () => {
    if (!isAuthenticated.value) {
      dispatch(setLoginModalOpen(true));
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  function encodeImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!isAuthenticated.value) {
        dispatch(setLoginModalOpen(true));
      } else {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Limit to 2 attachments
        if (attachments.length >= 2) {
          alert("You can only attach up to 2 files");
          return;
        }

        const newFile = files[0];

        // Validate file type
        const validImageTypes = ["image/jpeg", "image/png"];
        const isValidType = validImageTypes.includes(newFile.type);

        if (!isValidType) {
          alert("Please upload only images.");
          return;
        }

        // Generate a unique file name
        const uniqueFileName = `upload_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        // Show loading state
        setAttachments((prev) => [
          ...prev,
          {
            file: newFile,
            preview: "",
            type: "image",
            isUploading: true,
            name: uniqueFileName, // Store unique name
          },
        ]);

        // Upload to S3 or server
        const uploadedUrl = await getPresignedUrl(newFile, uniqueFileName);
        if (!uploadedUrl) {
          dispatch(
            setNotification({
              modalOpen: true,
              status: "error",
              text: "Error uploading!",
            })
          );
          return;
        }

        dispatch(addImageURL(uploadedUrl));

        // Convert image to Base64
        const base64Image = await encodeImageToBase64(newFile);
        dispatch(addImage(base64Image));

        // Create preview URL
        const filePreview = URL.createObjectURL(newFile);

        // Update attachment list (remove loading state & add URL)
        setAttachments((prev) =>
          prev.map((att) =>
            att.file === newFile
              ? {
                  ...att,
                  preview: filePreview,
                  isUploading: false,
                  uploadedUrl, // Store URL
                }
              : att
          )
        );
      }
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      // Reset file input
      e.target.value = "";
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => {
      const newAttachments = [...prev];

      // Remove from Redux using index
      dispatch(removeImage(index));
      dispatch(removeImageURL(index));

      // Revoke object URL to free memory
      if (newAttachments[index]?.preview) {
        URL.revokeObjectURL(newAttachments[index].preview);
      }

      // Remove the attachment from state
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  const getPresignedUrl = async (file: File, name: string): Promise<string> => {
    try {
      const response = await fetch(`${API}/get-presigned-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: name,
          fileType: file.type,
          email: email.value,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { uploadURL, url } = await response.json();
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed! status: ${uploadResponse.status}`);
      }

      return url;
    } catch (error) {
      console.error("Upload failed:", error);
      setAttachments((prev) => {
        const failedAttachmentIndex = prev.length - 1;
        if (failedAttachmentIndex < 0) return prev;

        const newAttachments = [...prev];
        const failedAttachment = newAttachments[failedAttachmentIndex];

        // Remove from Redux
        dispatch(removeImage(failedAttachmentIndex));
        dispatch(removeImageURL(failedAttachmentIndex));

        // Cleanup preview URL
        if (failedAttachment?.preview) {
          URL.revokeObjectURL(failedAttachment.preview);
        }

        // Remove the failed attachment
        newAttachments.splice(failedAttachmentIndex, 1);
        return newAttachments;
      });

      dispatch(
        setNotification({
          modalOpen: true,
          status: "error",
          text: "Failed to upload image. Please try again.",
        })
      );

      throw new Error("Failed to get presigned URL");
    }
  };

  useEffect(() => {
    // Only check subscription status once when component mounts
    const checkStatus = async () => {
      if (isAuthenticated.value && email.value && !checkRef.current) {
        checkRef.current = true;
        await checkSubscriptionStatus();
      }
    };

    checkStatus();

    // Cleanup function for attachments
    return () => {
      attachments.forEach((attachment) => {
        if (attachment.preview) {
          URL.revokeObjectURL(attachment.preview);
        }
      });
    };
  }, []); // Empty dependency array to ensure it only runs once

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    sessionStorage.clear();
    if (loading) return;

    if (input.trim()) {
      sessionStorage.setItem("input", input);
      sessionStorage.setItem("memory", memory);
      sessionStorage.setItem("framework", framework);
      sessionStorage.setItem("css", cssLibrary);
      const characters = "abcdefghijklmnopqrstuvwxyz123456789";
      const generateSegment = (length: number) =>
        Array.from({ length }, () =>
          characters.charAt(Math.floor(Math.random() * characters.length))
        ).join("");

      const projectId = `${generateSegment(8)}-${generateSegment(8)}-${generateSegment(8)}-${generateSegment(8)}`;

      sessionStorage.setItem("projectId", projectId);

      if (isAuthenticated.value && projectId && email.value && !loading) {
        dispatch(setGenerating({ generating: true }));

        router.push(`/projects/${projectId}`);
      } else {
        dispatch(setLoginModalOpen(true));
      }
    }
  }, [input, framework, memory, cssLibrary]);

  return (
    <main className="min-h-screen bg-[#0A0A0D] grid grid-cols-1 gap-10 md:gap-16 px-6 py-24 overflow-hidden relative">
      {/* Spotlight Effect */}
      <Spotlight />

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="w-full max-w-4xl mx-auto mt-10 justify-center items-center flex">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={mainContentVariants}
          className="text-center space-y-5"
        >
          <h1 className="text-2xl sm:text-6xl text-balance font-bold text-white tracking-tight leading-tight">
            Prompt it, tweak it,
            <span className="bg-gradient-to-r from-[#7661F4] to-[#FF7AFF] text-transparent bg-clip-text">
              {"  "}ship it
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-[#b1b1b1] font-medium max-w-xl mx-auto">
            Your <span className="text-[#7661F4]">AI Frontend Engineer</span>,
            built to take your ideas from concept to reality and beyond!
          </p>
        </motion.div>
      </section>

      {/* Input Section */}
      <section aria-label="prompt-input" className="w-full max-w-2xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={inputBoxVariants}
          className="w-full space-y-4"
        >
          {needsUpgrade.value && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="justify-center items-center flex text-center p-2 rounded-lg bg-[#1c1c1d] backdrop-blur-sm shadow-lg my-1"
            >
              <div className="flex items-center gap-2 text-sm font-sans font-medium text-white">
                Looks like you&rsquo;ve hit your prompt limit, upgrade to keep
                the creativity flowing!
              </div>
            </motion.div>
          )}
          {/*  TEXT INPUT (FIRST) */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-[#141415] rounded-lg p-4 flex flex-col items-start justify-center shadow-lg min-h-[120px] w-full"
          >
            {/* Attachment Preview */}
            <AttachmentPreview
              attachments={attachments}
              onRemove={handleRemoveAttachment}
            />

            <textarea
              maxLength={3000}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-white outline-none text-sm resize-none w-full min-h-[100px] max-h-[250px] overflow-hidden scrollbar-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();

                  if (needsUpgrade.value) {
                    dispatch(setPricingModalOpen(true));
                  } else {
                    if (input.trim() && !loading) {
                      handleGenerate();
                    }
                  }
                }
              }}
            />

            {/* Action Buttons */}
            <div className="justify-between items-center flex w-full">
              <button
                disabled={loading}
                onClick={handleAttachClick}
                className="cursor-pointer text-[#71717A] bg-[#201F22] px-2 p-1 rounded-md text-xs font-sans font-medium gap-x-1 flex justify-center items-center hover:bg-[#2a292c] transition-colors"
              >
                <FaPaperclip />
                Attach
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              {needsUpgrade.value ? (
                <button
                  disabled={loading}
                  onClick={() => {
                    dispatch(setPricingModalOpen(true));
                  }}
                  className="justify-center items-center flex font-sans py-1 gap-x-1 font-medium text-white bg-[#7163F3] rounded-md hover:bg-[#6a5bf3] text-xs border border-[#6A65F2] cursor-pointer px-2 p-1"
                >
                  Upgrade to scale
                  <BsLightningChargeFill />
                </button>
              ) : (
                <button
                  disabled={loading}
                  onClick={handleGenerate}
                  className="cursor-pointer hover:bg-gray-200 text-[#71717A] bg-white p-2 rounded-md text-xs font-sans font-medium gap-x-1 flex justify-center items-center"
                >
                  {loading ? (
                    <LuLoaderCircle className="animate-spin" />
                  ) : (
                    <FaArrowRight />
                  )}
                </button>
              )}
            </div>
          </motion.div>

          {/*  FRAMEWORK & CSS DROPDOWNS (SECOND) */}
          <div className="flex flex-col md:flex-row items-center justify-between text-gray-400 text-sm space-y-2 md:space-y-0">
            {/* framework */}
            <div className="flex flex-col w-full md:w-[48%]">
              <label className="mb-1 text-gray-500">
                Choose Your Framework
              </label>
              {/* Arrow */}
              <div className="relative w-full">
                <select
                  disabled={loading}
                  value={framework}
                  onChange={(e) => {
                    setFramework(e.target.value);
                  }}
                  className="bg-[#141415] text-white px-3 p-2 pr-10 rounded-md outline-none appearance-none w-full"
                >
                  {/* <option value="next">Next.js</option> */}
                  <option value="react">React</option>
                  <option value="vue">Vue.js</option>
                  <option value="Basic HTML">Basic HTML</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {/* CSS */}
            <div className="relative flex flex-col w-full md:w-[48%]">
              <label className="mb-1 text-gray-500">Choose Your CSS</label>
              <div className="relative">
                <select
                  disabled={loading}
                  value={cssLibrary}
                  onChange={(e) => {
                    setCssLibrary(e.target.value);
                  }}
                  className="bg-[#141415] text-white px-3 p-2 pr-10 rounded-md outline-none appearance-none w-full"
                >
                  <option value="tailwind">Tailwind CSS</option>
                  <option value="css">CSS</option>
                  {/* <option value="sass">SASS</option> */}
                  <option value="Styled Components">Styled Components</option>
                </select>
                <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/*  MEMORY SECTION (LAST) */}
          <div
            aria-label="actions"
            className="w-full max-w-2xl mx-auto mt-3 gap-y-3"
          >
            <label className="text-gray-500 text-sm">
              Memory - eg. Dark mode. Sharp edges. Always!
            </label>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="border border-[#1D1D1F] p-3 rounded-lg min-h-[150px]"
            >
              <textarea
                disabled={loading}
                className="w-full bg-transparent text-white outline-none mt-1 text-sm resize-none min-h-[130px] overflow-y-auto"
                placeholder="Keep in mind that..."
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                rows={4}
              />
            </motion.div>
          </div>

          <>
            {/* Line */}
            <motion.div
              className="w-full h-[1px] bg-gradient-to-r from-[#0A0A0A] via-white to-[#0A0A0A] opacity-50 my-10"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 0.5, scaleX: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
            {/*  IMPORT BUTTONS (THIRD) - web */}
            <div className="hidden sm:block relative group ">
              <nav className=" grid grid-cols-2 md:grid-cols-4 gap-3 text-sm group-hover:blur-sm transition-all duration-300">
                {[
                  "Import from Github",
                  "Import from Web",
                  "Import from Figma",
                  "Upload",
                ].map((text, index) => (
                  <motion.button
                    key={index}
                    whileHover="hover"
                    variants={buttonHoverVariants}
                    className="text-gray-400 hover:text-white border border-[#1D1D1F] backdrop-blur-md px-2 sm:px-4 py-2 rounded-md transition-all truncate text-xs sm:text-sm flex items-center justify-center h-10 sm:h-auto"
                  >
                    {text}
                  </motion.button>
                ))}
              </nav>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                <span className="text-white font-medium font-sans text-sm px-4 py-2 rounded-md">
                  Coming Soon
                </span>
              </div>
            </div>

            {/*  IMPORT BUTTONS (THIRD) - mobile */}
            <div className=" md:hidden relative  ">
              <nav className=" grid grid-cols-2 md:grid-cols-4 gap-3 text-sm blur-[1.5px] transition-all duration-300">
                {[
                  "Import from Github",
                  "Import from Web",
                  "Import from Figma",
                  "Upload",
                ].map((text, index) => (
                  <motion.button
                    key={index}
                    whileHover="hover"
                    variants={buttonHoverVariants}
                    className="text-gray-400 hover:text-white border border-[#1D1D1F] backdrop-blur-md px-2 sm:px-4 py-2 rounded-md transition-all truncate text-xs sm:text-sm flex items-center justify-center h-10 sm:h-auto"
                  >
                    {text}
                  </motion.button>
                ))}
              </nav>
              <div className="absolute inset-0 flex items-center justify-center  opacity-100 transition-opacity duration-300 z-50">
                <span className="text-white font-medium font-sans text-xs md:text-sm px-4 py-2 rounded-md">
                  Coming Soon
                </span>
              </div>
            </div>
          </>
        </motion.div>
      </section>
    </main>
  );
};

export default Hero;
