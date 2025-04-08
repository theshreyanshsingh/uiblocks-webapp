"use client";

import { NextPage } from "next";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import logo from "@/app/assets/logo.png";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";

// In-memory store for animated message keys (persists across mounts in session)
const animatedMessages = new Set<string>();

const Messages: NextPage = () => {
  const { messages } = useSelector(
    (state: RootState) => state.messagesprovider
  );
  const { generating } = useSelector(
    (state: RootState) => state.projectOptions
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [displayedText, setDisplayedText] = useState<string[]>([]); // Only tracks current text
  const [waitingForResponse, setWaitingForResponse] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedText]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const lastMessageKey = `${lastMessage.role}-${lastMessage.text}-${messages.length - 1}`;

      // Initialize displayedText if needed
      if (displayedText.length < messages.length) {
        setDisplayedText(
          messages.map((msg, idx) => {
            const key = `${msg.role}-${msg.text}-${idx}`;
            return animatedMessages.has(key)
              ? msg.text || ""
              : displayedText[idx] || "";
          })
        );
      }

      if (lastMessage.role === "user") {
        setWaitingForResponse(true);
      } else if (
        lastMessage.role === "ai" &&
        !animatedMessages.has(lastMessageKey)
      ) {
        setWaitingForResponse(false);
        const words = (lastMessage.text || "").split(" ");
        let currentText = "";
        let index = 0;

        const streamMessage = setInterval(() => {
          if (index < words.length) {
            currentText = words.slice(0, index + 1).join(" ");
            setDisplayedText((prev) => {
              const newText = [...prev];
              newText[messages.length - 1] = currentText;
              return newText;
            });
            index++;
          } else {
            animatedMessages.add(lastMessageKey); // Mark as animated
            clearInterval(streamMessage);
          }
        }, 100);

        return () => clearInterval(streamMessage);
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col gap-5 p-4 overflow-y-auto flex-1">
      {messages &&
        messages.length > 0 &&
        messages.map((msg, index) => {
          const messageKey = `${msg.role}-${msg.text}-${index}`;
          const isAnimated = animatedMessages.has(messageKey);

          return (
            <div
              key={messageKey}
              className={`flex flex-col ${msg.role === "user" ? "items-end px-1" : "items-start"}`}
            >
              <div className="flex items-center gap-2">
                {msg.role === "ai" && (
                  <Image
                    src={logo}
                    alt="Bot Logo"
                    width={20}
                    height={20}
                    className="rounded-md"
                  />
                )}
                <span className="text-xs text-gray-400">
                  {msg.role !== "ai" ? "user" : null}
                </span>
              </div>
              <motion.p
                className="text-sm font-sans p-3 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Images */}
                {msg.role === "user" && (
                  <span className="justify-end items-center flex space-x-2 p-2 h-">
                    {msg.images &&
                      msg.images.length > 0 &&
                      msg.images?.map((i, index) => (
                        <Image
                          priority
                          unoptimized
                          key={index}
                          src={i}
                          alt={`$image_{index}`}
                          width={30}
                          height={30}
                          className="rounded-md h-20 w-20 "
                        />
                      ))}
                  </span>
                )}

                {msg.role === "ai" && !isAnimated && displayedText[index]
                  ? displayedText[index].split(" ").map((word, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: i * 0.05,
                          ease: "easeOut",
                        }}
                      >
                        {word}{" "}
                      </motion.span>
                    ))
                  : displayedText[index] || msg.text || ""}
              </motion.p>
              {/* Seperator */}
              {messages[index + 1] && messages[index + 1].role !== msg.role && (
                <motion.div
                  className="w-full h-[1px] bg-gradient-to-r from-[#0A0A0A] via-gray-700 to-[#0A0A0A] opacity-50 my-3"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 0.5, scaleX: 1 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              )}
            </div>
          );
        })}
      {waitingForResponse && generating && (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Image
            src={logo}
            alt="Bot Logo"
            width={20}
            height={20}
            className="rounded-md"
          />
          <motion.p
            className="text-gray-400 text-xs font-sans font-medium"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.7, 1, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            Thinking...
          </motion.p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;
