"use client";

// Ensure useState, useRef, useEffect are imported from React
import React, { useMemo, useState, useRef, useEffect } from "react";
// Ensure AnimatePresence is imported from framer-motion
import { motion, AnimatePresence } from "framer-motion";
// Import SyntaxHighlighter and the vs2015 style
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs"; // Using prism version
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store"; // Assuming this path is correct
import { setReaderMode } from "@/app/redux/reducers/projectOptions";
import { MdOutlineChevronLeft } from "react-icons/md";
import { LuLoader } from "react-icons/lu";
import { FaCheck } from "react-icons/fa6";

// --- Regex Definitions ---
const STEPS_REGEX = /"Steps":\s*"([\s\S]*?)(?:"(?:\s*,\s*")|"$)/; // Tries to match complete steps value
const STEPS_REGEX_PARTIAL_START = /"Steps":\s*"([\s\S]*)/; // Matches from "Steps": " onwards
const GENERATED_FILE_REGEX =
  /"(\/[^"]+)":\s*\{\s*"code":\s*"((?:\\.|[^"\\])*)"\s*}/g;
const FILE_LIST_ITEM_REGEX = /"(\/[^"]+)"/g;
const POTENTIAL_FILE_PATH_KEY_REGEX = /"(\/[^"]+)"\s*:/g;

// --- Helper to Decode JSON String Escapes ---
function decodeJsonString(str: string | null | undefined): string {
  if (!str) return "";
  try {
    return str
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "\r")
      .replace(/\\f/g, "\f")
      .replace(/\\b/g, "\b")
      .replace(/\\\\/g, "\\");
  } catch (e) {
    console.error("Error decoding string:", e);
    return str;
  }
}

// --- Helper to guess language from file path ---
function guessLanguage(filePath: string): string {
  const extension = filePath.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "py":
      return "python";
    case "java":
      return "java";
    case "c":
      return "c";
    case "cpp":
      return "cpp";
    case "cs":
      return "csharp";
    case "html":
      return "markup";
    case "css":
      return "css";
    case "scss":
      return "scss";
    case "less":
      return "less";
    case "json":
      return "json";
    case "yaml":
    case "yml":
      return "yaml";
    case "md":
      return "markdown";
    case "sh":
      return "bash";
    case "toml":
      return "toml";
    default:
      return "plaintext";
  }
}

// --- Types ---
type ProcessedStatus =
  | "empty"
  | "raw_unexpected"
  | "streaming_json"
  | "potentially_complete";
interface ProcessedBase {
  status: ProcessedStatus;
  raw: string;
}
interface ProcessedRaw extends ProcessedBase {
  status: "raw_unexpected";
}
interface ProcessedEmpty extends ProcessedBase {
  status: "empty";
}
interface ProcessedJson extends ProcessedBase {
  status: "streaming_json" | "potentially_complete";
  innerContent: string;
  stepsContent: string | null; // Single property for steps
  identifiedCompleteCodeBlocks: {
    filePath: string;
    codeContent: string;
    id: string;
  }[];
  potentialCodeBlockPaths: { filePath: string; id: string }[];
  identifiedFileListItems: string[];
  hasGenFilesKey: boolean;
  hasFilesKey: boolean;
  hasJsonPrefix: boolean;
  hasJsonSuffix: boolean;
  hasStepsKey: boolean;
}
type ProcessedResult = ProcessedEmpty | ProcessedRaw | ProcessedJson;

// --- Simple SVG Spinner Component ---
const Spinner: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
);

// --- Main Component ---
const StreamedProgressiveDisplay: React.FC = () => {
  const { markdown } = useSelector((state: RootState) => state.projectFiles);

  const dispatch = useDispatch();

  const handleRead = () => {
    dispatch(setReaderMode(false));
  };

  // --- Memoized Content Processing ---
  const processedContent: ProcessedResult = useMemo(() => {
    const rawString = typeof markdown === "string" ? markdown : "";
    if (!rawString.trim()) return { status: "empty", raw: rawString };
    const hasJsonPrefix = rawString.startsWith("```json\n");
    const hasJsonSuffix = rawString.endsWith("```");
    if (!hasJsonPrefix) return { status: "raw_unexpected", raw: rawString };
    const innerContent = rawString
      .substring(
        "```json\n".length,
        hasJsonSuffix ? rawString.length - "```".length : rawString.length
      )
      .trimStart();
    const hasStepsKey = innerContent.includes('"Steps":');
    let stepsContent: string | null = null;
    const stepsCompleteMatch = innerContent.match(STEPS_REGEX); // Use strict regex here
    if (stepsCompleteMatch) {
      stepsContent = decodeJsonString(stepsCompleteMatch[1]);
    } else if (hasStepsKey) {
      const stepsPartialMatch = innerContent.match(STEPS_REGEX_PARTIAL_START);
      stepsContent = stepsPartialMatch
        ? decodeJsonString(stepsPartialMatch[1])
        : null;
    }
    const potentialCodeBlockPaths: { filePath: string; id: string }[] = [];
    const genFilesBlockMatch = innerContent.match(
      /"generatedFiles":\s*\{([\s\S]*)/
    );
    let potentialIndex = 0;
    if (genFilesBlockMatch?.[1]) {
      const genFilesContent = genFilesBlockMatch[1];
      for (const match of genFilesContent.matchAll(
        POTENTIAL_FILE_PATH_KEY_REGEX
      )) {
        if (match[1]) {
          potentialCodeBlockPaths.push({
            filePath: match[1],
            id: `${match[1]}-${potentialIndex++}`,
          });
        }
      }
    }
    const identifiedCompleteCodeBlocks: {
      filePath: string;
      codeContent: string;
      id: string;
    }[] = [];
    const completeBlocksMap = new Map<string, string>();
    if (genFilesBlockMatch?.[1]) {
      const genFilesContent = genFilesBlockMatch[1];
      let completeIndex = 0;
      for (const match of genFilesContent.matchAll(GENERATED_FILE_REGEX)) {
        if (match[1] && match[2] !== undefined) {
          const filePath = match[1];
          const codeContent = decodeJsonString(match[2]);
          const potentialBlock = potentialCodeBlockPaths.find(
            (p) => p.filePath === filePath && !completeBlocksMap.has(p.id)
          );
          const id = potentialBlock
            ? potentialBlock.id
            : `${filePath}-${completeIndex++}`;
          identifiedCompleteCodeBlocks.push({ filePath, codeContent, id });
          completeBlocksMap.set(id, codeContent);
        }
      }
    }
    const identifiedFileListItems: string[] = [];
    const filesArrayBlockMatch = innerContent.match(/"files":\s*\[([\s\S]*)/);
    if (filesArrayBlockMatch?.[1]) {
      const filesArrayContent = filesArrayBlockMatch[1];
      for (const match of filesArrayContent.matchAll(FILE_LIST_ITEM_REGEX)) {
        if (match[1]) identifiedFileListItems.push(match[1]);
      }
    }

    const hasGenFilesKey = innerContent.includes('"generatedFiles":');
    const hasFilesKey = innerContent.includes('"files":');
    return {
      status: hasJsonSuffix ? "potentially_complete" : "streaming_json",
      raw: rawString,
      innerContent: innerContent,
      stepsContent,
      potentialCodeBlockPaths,
      identifiedCompleteCodeBlocks,
      identifiedFileListItems,
      hasGenFilesKey,
      hasFilesKey,
      hasJsonPrefix: true,
      hasJsonSuffix,
      hasStepsKey,
    };
  }, [markdown]);

  // --- State & Toggle ---
  const [openCodeBlocks, setOpenCodeBlocks] = useState<Set<string>>(new Set());
  // const toggleCodeBlock = (id: string, isComplete: boolean) => {
  //   if (isComplete) {
  //     setOpenCodeBlocks((prev) => {
  //       const next = new Set(prev);
  //       next.has(id) ? next.delete(id) : next.add(id);
  //       return next;
  //     });
  //   }
  // };
  const toggleCodeBlock = (id: string, isComplete: boolean) => {
    if (isComplete) {
      setOpenCodeBlocks((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    }
  };
  // --- Ref and Effect for Auto-Scrolling ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [markdown]);

  // --- Animation Variants ---
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.1 },
    },
  };
  const itemEnterVariant = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };
  const codeRevealVariant = {
    collapsed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
  };

  // --- Render Logic ---

  if (processedContent.status === "empty")
    return (
      <div className="p-4 text-gray-400 italic text-sm font-sans">
        Just a bit more...
      </div>
    );

  if (processedContent.status === "raw_unexpected") {
    return (
      <motion.div
        className="text-white p-4 border border-[#1c1b1b] rounded-md bg-black"
        initial="initial"
        animate="animate"
        variants={containerVariants}
      >
        <p className="text-sm text-white font-semibold mb-2">
          {" "}
          Generating Raw data{" "}
        </p>
        <pre className="whitespace-pre-wrap break-words font-mono text-xs text-gray-300">
          {" "}
          <code>{processedContent.raw}</code>{" "}
        </pre>
      </motion.div>
    );
  }

  // --- Render JSON Stream ---
  return (
    <motion.div
      ref={scrollContainerRef}
      className="container mx-auto p-4 text-white overflow-y-auto max-h-[calc(100vh-100px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Status Indicator */}
      <div className="flex justify-between sticky top-0 items-center border-b border-[#1c1b1b] pb-2 mb-4 rounded-lg bg-black/50 backdrop-blur-sm py-2 -mx-4 px-4">
        <button onClick={handleRead} className="cursor-pointer">
          <MdOutlineChevronLeft className="text-white" />
        </button>
        <p className="text-sm text-white font-sans font-medium">
          {processedContent.status === "streaming_json"
            ? "Generation in progress..."
            : "Preview is available"}
        </p>
        {!processedContent.hasJsonSuffix && (
          <span className="text-xs bg-yellow-700 px-2 py-0.5 rounded animate-pulse">
            <LuLoader className="text-sm text-white animate-spin" />
          </span>
        )}
        {processedContent.hasJsonSuffix && (
          <span className="text-xs px-2 py-0.5 rounded">
            <FaCheck className="text-white" />
          </span>
        )}
      </div>

      {/* --- Steps Section --- CORRECTED ELLIPSIS LOGIC --- */}
      {processedContent.hasStepsKey && (
        <motion.section variants={itemEnterVariant} className="mb-4">
          <h2 className="text-xl font-bold mb-2">This is what I am doing:</h2>
          <p className="mb-1 text-xs leading-loose tracking-wider whitespace-pre-wrap text-[#d7d9dc]">
            {processedContent.stepsContent ?? ""}
            {/* Show ellipsis if streaming AND strict regex check fails */}
            {processedContent.status === "streaming_json" &&
            !processedContent.innerContent?.match(STEPS_REGEX)
              ? "..."
              : ""}
          </p>
        </motion.section>
      )}
      {/* END OF STEPS SECTION */}

      {/* === Generated Files Section === */}
      {processedContent.hasGenFilesKey && (
        <motion.section variants={itemEnterVariant} className="mb-4">
          <h2 className="text-xl font-bold mb-2">Generated Files:</h2>
          {processedContent.potentialCodeBlockPaths.length > 0 ? (
            <div className="space-y-4">
              {processedContent.potentialCodeBlockPaths.map(
                (potentialBlock) => {
                  const isComplete =
                    processedContent.identifiedCompleteCodeBlocks.some(
                      (cb) => cb.id === potentialBlock.id
                    );
                  const completedBlockData = isComplete
                    ? processedContent.identifiedCompleteCodeBlocks.find(
                        (cb) => cb.id === potentialBlock.id
                      )
                    : null;
                  const isOpen = openCodeBlocks.has(potentialBlock.id);
                  const codeContent = completedBlockData?.codeContent ?? "";
                  const language = guessLanguage(potentialBlock.filePath);
                  return (
                    <motion.div
                      key={potentialBlock.id}
                      variants={itemEnterVariant}
                      className="rounded-lg bg-[#0F0F0F] border border-[#1c1b1b] overflow-hidden"
                    >
                      <button
                        disabled={!isComplete}
                        onClick={() =>
                          toggleCodeBlock(potentialBlock.id, isComplete)
                        }
                        className={`w-full text-left flex justify-between items-center text-xs font-medium p-2 text-gray-300 transition-colors duration-150 ${!isComplete ? "cursor-default opacity-70" : "hover:bg-gray-700/50 cursor-pointer"}`}
                        aria-expanded={isComplete ? isOpen : undefined}
                        aria-controls={
                          isComplete
                            ? `code-content-${potentialBlock.id}`
                            : undefined
                        }
                      >
                        <span>{potentialBlock.filePath}</span>
                        <div className="ml-2 flex-shrink-0 w-3 h-3 text-gray-400">
                          {!isComplete ? (
                            <Spinner className="w-full h-full" />
                          ) : (
                            <motion.div
                              animate={{ rotate: isOpen ? 0 : -90 }}
                              transition={{ duration: 0.2 }}
                            >
                              <svg
                                className="w-full h-full"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                                />
                              </svg>
                            </motion.div>
                          )}
                        </div>
                      </button>
                      <AnimatePresence initial={false}>
                        {isComplete && isOpen && (
                          <motion.div
                            id={`code-content-${potentialBlock.id}`}
                            key="content"
                            initial="collapsed"
                            animate="open"
                            exit="collapsed"
                            variants={codeRevealVariant}
                            className="border-t border-[#1c1b1b]"
                          >
                            <SyntaxHighlighter
                              language={language}
                              style={vs2015}
                              customStyle={{
                                margin: 0,
                                padding: "0.75rem",
                                maxHeight: "400px",
                                overflowY: "auto",
                                backgroundColor: "#1E1E1E",
                                fontSize: "0.75rem",
                              }}
                              wrapLongLines={true}
                              className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                            >
                              {codeContent}
                            </SyntaxHighlighter>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                }
              )}
              {processedContent.status === "streaming_json" &&
                !processedContent.innerContent?.match(
                  /"generatedFiles":\s*\{[\s\S]*?\},?\s*"files"/
                ) && (
                  <p className="text-xs italic text-gray-400">
                    {" "}
                    ... writing more files{" "}
                  </p>
                )}
            </div>
          ) : (
            <p className="text-xs italic text-gray-400">
              {" "}
              Identifying file contents...{" "}
            </p>
          )}
        </motion.section>
      )}
      {/* END OF GENERATED FILES SECTION */}

      {/* --- Files List Section --- */}
      {processedContent.hasFilesKey && (
        <motion.section variants={itemEnterVariant} className="mb-4">
          <h2 className="text-xl font-semibold mb-2">
            {" "}
            Files Created/Modified:{" "}
          </h2>
          {processedContent.identifiedFileListItems.length > 0 ? (
            <div className="border border-[#1c1b1b] rounded-md bg-black p-3 flex flex-col space-y-1">
              {processedContent.identifiedFileListItems.map(
                (filePath, index) => (
                  <p
                    key={`${filePath}-${index}`}
                    className="text-xs font-mono text-gray-300"
                  >
                    {" "}
                    {filePath}{" "}
                  </p>
                )
              )}
              {processedContent.status === "streaming_json" &&
                !processedContent.innerContent?.match(
                  /"files":\s*\[[\s\S]*?\],?\s*"filesCount"/
                ) && (
                  <p className="text-xs italic text-gray-400">
                    {" "}
                    ...writing a few more files{" "}
                  </p>
                )}
            </div>
          ) : (
            <p className="text-xs italic text-gray-400">
              {" "}
              Identifying file list...{" "}
            </p>
          )}
        </motion.section>
      )}
      {/* END OF FILES LIST SECTION */}

      {/* --- Fallback/Debug --- */}
      {processedContent.status === "streaming_json" ||
      processedContent.status === "potentially_complete" // Ensure it's a JSON type first explicitly if needed for absolute clarity, though implicitly true here
        ? processedContent.stepsContent === null &&
          !processedContent.hasGenFilesKey &&
          !processedContent.hasFilesKey &&
          processedContent.innerContent && // Check innerContent exists on ProcessedJson
          processedContent.innerContent.length > 0 && (
            <motion.section variants={itemEnterVariant} className="mb-4">
              {" "}
              {/* Original animation + classes */}
              <h2 className="text-lg font-semibold mb-2 text-gray-300">
                {" "}
                Raw Stream Content:{" "}
              </h2>
              <pre className="border border-[#1c1b1b] rounded-md bg-black p-3 whitespace-pre-wrap break-words font-mono text-xs max-h-[70vh] overflow-auto">
                <code>{processedContent.innerContent}</code>
              </pre>
            </motion.section>
          )
        : null}
      {/* END OF FALLBACK/DEBUG SECTION */}
    </motion.div>
  );
};

export default StreamedProgressiveDisplay;

// --- Remember to add scrollbar styling to your global CSS ---
/* ... (scrollbar styles) ... */
