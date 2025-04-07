"use client";

import AttachmentPreview from "@/app/_components/AttachmentPreview";
import { useGenerateFile } from "@/app/_services/useGenerateFile";
import { API } from "@/app/config/Config";
import { useAuthenticated } from "@/app/helpers/useAuthenticated";
import {
  addImage,
  addImageURL,
  removeImage,
  removeImageURL,
  setPricingModalOpen,
} from "@/app/redux/reducers/basicData";
import { sendaMessage } from "@/app/redux/reducers/Mesages";
import { setNotification } from "@/app/redux/reducers/NotificationModalReducer";
import { setPromptCount } from "@/app/redux/reducers/projectOptions";
import { RootState } from "@/app/redux/store";

import { NextPage } from "next";
import React, { useState, useRef, useCallback } from "react";
import { BsArrowUp } from "react-icons/bs";
import { FaPaperclip } from "react-icons/fa6";
import { LuLoaderCircle } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";

const Keyboard: NextPage = () => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dispatch = useDispatch();
  const { email } = useAuthenticated();
  const [attachments, setAttachments] = useState<
    Array<{
      file: File;
      preview: string;
      type: "image";
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { sendMessagetoAI } = useGenerateFile();

  const { generating, promptCount } = useSelector(
    (state: RootState) => state.projectOptions
  );
  const { imageURLs } = useSelector((state: RootState) => state.basicData);

  const handleMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!message.trim()) return;

      try {
        const msg: {
          role: "user" | "ai";
          text: string;
          images?: string[];
        } = {
          role: "user",
          text: message,
          images: imageURLs || [],
        };

        dispatch(sendaMessage(msg));
        if (typeof promptCount === "number" && promptCount > 0) {
          dispatch(setPromptCount(promptCount - 1));
        }
        sendMessagetoAI({ message: msg });
        setAttachments([]);

        setMessage("");
      } catch (err) {
        dispatch(
          setNotification({
            modalOpen: true,
            status: "error",
            text: "Somthing's off can't send messages!",
          })
        );
        console.error("JSON parse error:", err);
      }

      if (textareaRef.current) {
        textareaRef.current.style.height = "40px";
      }
    },
    [message, imageURLs]
  );

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
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

      const { uploadURL, url } = await response.json();
      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      return url;
    } catch (error) {
      console.error("Upload failed:", error);
      throw new Error("Failed to get presigned URL");
    }
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <form
      name="keyboard"
      onSubmit={handleMessage}
      className="flex flex-col items-start justify-between rounded-lg space-y-3"
    >
      {/* Attachment Preview */}
      <AttachmentPreview
        attachments={attachments}
        onRemove={handleRemoveAttachment}
      />

      {/* Text Area (Auto-Expanding) */}
      <textarea
        maxLength={3000}
        ref={textareaRef}
        className="flex-1 bg-transparent outline-none text-white w-full p-1 text-sm resize-none overflow-y-auto rounded-lg min-h-[60px] max-h-[150px]"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          adjustTextareaHeight();
        }}
        onKeyDown={async (e) => {
          if (e.key === "Enter" && !e.shiftKey && !generating) {
            e.preventDefault();

            if (
              promptCount !== null &&
              promptCount !== undefined &&
              promptCount < 1
            ) {
              dispatch(setPricingModalOpen(true));
            } else {
              if (message.trim()) {
                handleMessage(e);
              }
            }
          }
        }}
        onInput={adjustTextareaHeight}
      />
      <div className="flex justify-between items-center w-full">
        <p className="text-xs font-sans font-medium text-[#70717B]">
          {promptCount} prompt left
        </p>

        {/* Upgrade/Send msgs */}
        {promptCount !== null &&
        promptCount !== undefined &&
        promptCount < 1 ? (
          <motion.button
            type="button"
            onClick={() => {
              dispatch(setPricingModalOpen(true));
            }}
            className="relative overflow-hidden bg-gradient-to-r from-[#7B60F4] to-[#583fd3] text-white font-medium rounded-lg px-2 py-1 shadow-lg mx-2"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0.9 }}
            animate={{
              opacity: 1,
              boxShadow: [
                "0 4px 12px rgba(123, 96, 244, 0.3)",
                "0 6px 16px rgba(123, 96, 244, 0.4)",
                "0 4px 12px rgba(123, 96, 244, 0.3)",
              ],
              transition: {
                boxShadow: {
                  repeat: Infinity,
                  duration: 2,
                },
              },
            }}
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-[#7B60F4] to-[#583fd3] opacity-70"
              animate={{
                background: [
                  "linear-gradient(90deg, #7B60F4 0%, #583fd3 100%)",
                  "linear-gradient(90deg, #583fd3 0%, #7B60F4 100%)",
                  "linear-gradient(90deg, #7B60F4 0%, #583fd3 100%)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Neon Border Animation - Main Glow */}
            <motion.div
              className="absolute -inset-[3px] rounded-lg z-0"
              style={{ background: "transparent", pointerEvents: "none" }}
              animate={{
                boxShadow: [
                  "0 0 8px 3px rgba(123, 96, 244, 0.9), 0 0 15px 8px rgba(123, 96, 244, 0.6), 0 0 25px 12px rgba(123, 96, 244, 0.3)",
                  "0 0 12px 5px rgba(123, 96, 244, 1), 0 0 22px 12px rgba(123, 96, 244, 0.7), 0 0 35px 18px rgba(123, 96, 244, 0.4)",
                  "0 0 8px 3px rgba(123, 96, 244, 0.9), 0 0 15px 8px rgba(123, 96, 244, 0.6), 0 0 25px 12px rgba(123, 96, 244, 0.3)",
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Spotlight Effect - Top Left Corner */}
            <motion.div
              className="absolute w-[20px] h-[20px] top-[-8px] left-[-8px] rounded-full z-0"
              animate={{
                boxShadow: [
                  "0 0 15px 7px rgba(123, 96, 244, 0.9)",
                  "0 0 22px 10px rgba(123, 96, 244, 1)",
                  "0 0 15px 7px rgba(123, 96, 244, 0.9)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />

            {/* Spotlight Effect - Top Right Corner */}
            <motion.div
              className="absolute w-[20px] h-[20px] top-[-8px] right-[-8px] rounded-full z-0"
              animate={{
                boxShadow: [
                  "0 0 15px 7px rgba(123, 96, 244, 0.9)",
                  "0 0 22px 10px rgba(123, 96, 244, 1)",
                  "0 0 15px 7px rgba(123, 96, 244, 0.9)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />

            {/* Spotlight Effect - Bottom Left Corner */}
            <motion.div
              className="absolute w-[20px] h-[20px] bottom-[-8px] left-[-8px] rounded-full z-0"
              animate={{
                boxShadow: [
                  "0 0 15px 7px rgba(123, 96, 244, 0.9)",
                  "0 0 22px 10px rgba(123, 96, 244, 1)",
                  "0 0 15px 7px rgba(123, 96, 244, 0.9)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.0,
              }}
            />

            {/* Spotlight Effect - Bottom Right Corner */}
            <motion.div
              className="absolute w-[20px] h-[20px] bottom-[-8px] right-[-8px] rounded-full z-0"
              animate={{
                boxShadow: [
                  "0 0 15px 7px rgba(123, 96, 244, 0.9)",
                  "0 0 22px 10px rgba(123, 96, 244, 1)",
                  "0 0 15px 7px rgba(123, 96, 244, 0.9)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.7,
              }}
            />

            <span className="relative z-10 flex items-center justify-center gap-x-1 text-xs font-sans font-medium">
              Upgrade to Scale
            </span>
          </motion.button>
        ) : (
          <div className="justify-center items-center flex space-x-1">
            {/* Attach Icon */}
            <button
              onClick={handleAttachClick}
              disabled={generating}
              type="button"
              className="hover:text-white transition p-1 flex justify-center items-center gap-x-2 text-xs font-sans text-[#70717B] font-medium rounded-lg px-2"
            >
              <FaPaperclip className="text-sm" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </button>
            {/* Send or Upgrade Button */}

            <button
              disabled={generating}
              type="button"
              onClick={handleMessage}
              className="hover:bg-white hover:text-black transition p-1 flex justify-center items-center gap-x-2 text-xs font-sans text-[#70717B] bg-[#1F2125] font-medium rounded-lg px-2"
            >
              {generating ? (
                <LuLoaderCircle className="text-sm animate-spin" />
              ) : (
                <BsArrowUp className="text-sm" />
              )}
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default Keyboard;
