import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setGenerating,
  setPromptCount,
  setReaderMode,
} from "../redux/reducers/projectOptions";
import {
  EmptySheet,
  setEmptyMarkdown,
  setMarkdown,
  setNewProjectData,
  setprojectData,
} from "../redux/reducers/projectFiles";
import { setNotification } from "../redux/reducers/NotificationModalReducer";
import { useAuthenticated } from "../helpers/useAuthenticated";
import { AppDispatch, RootState } from "../redux/store";
import { saveMoreDatatoProject, saveProject } from "./projects";
import { saveMsgToDb, sendaMessage } from "../redux/reducers/Mesages";
import { clearImages, clearImagesURL } from "../redux/reducers/basicData";

interface GenerateFileParams {
  email: string;
  projectId: string;
  input: string;
}

interface FetchProjectFilesParams {
  url: string;
}

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

// export const maxDuration = 60;

export const useGenerateFile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { email } = useAuthenticated();
  const { projectId, framework, csslib, memory, promptCount, enh_prompt } =
    useSelector((state: RootState) => state.projectOptions);
  const { data } = useSelector((state: RootState) => state.projectFiles); //files
  const { images, imageURLs } = useSelector(
    (state: RootState) => state.basicData
  );
  const { messages } = useSelector(
    (state: RootState) => state.messagesprovider
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleMessage = async (text: string) => {
    const msg: { role: "user" | "ai"; text: string } = {
      role: "ai",
      text: text,
    };

    dispatch(sendaMessage(msg));
  };

  function extractGeneratedFilesObjectString(rawMarkdown: any) {
    if (typeof rawMarkdown !== "string" || !rawMarkdown.trim()) {
      return null;
    }

    // Robust regex to handle variations in whitespace and newlines
    const jsonBlockRegex = /```json\s*?\n?([\s\S]*?)\n?```/;
    const match = rawMarkdown.match(jsonBlockRegex);

    if (!match) {
      return null;
    }

    try {
      const parsed = JSON.parse(match[1].trim());
      if (
        parsed &&
        typeof parsed.generatedFiles === "object" &&
        parsed.generatedFiles !== null
      ) {
        return parsed.generatedFiles;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
  const genFile = async ({ email, projectId, input }: GenerateFileParams) => {
    try {
      if (!email) return;

      const rawString = JSON.stringify({
        prompt: input,
        memory: sessionStorage.getItem("memory") || "",
        cssLibrary: sessionStorage.getItem("css") || "tailwindcss",
        framework: sessionStorage.getItem("framework") || "react",
        projectId: projectId || "",
        owner: email || "",
        images,
      });

      dispatch(
        setGenerating({
          generating: true,
          isResponseCompleted: true,
          generationSuccess: "thinking",
        })
      );
      dispatch(EmptySheet());
      dispatch(setReaderMode(false));
      setIsGenerating(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/old/agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: rawString,
      });

      if (!res.ok)
        throw new Error(`API Error: ${res.status} ${await res.text()}`);
      if (!res.body) throw new Error("Response body is null");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let finalData = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          // Check if it's a data line
          if (line.startsWith("data: ")) {
            const content = line.slice(6); // Remove "data: " prefix

            // Check if it's the end marker
            if (content === "[DONE]") {
              console.log("Stream completed");
              break;
            }

            // Handle regular content
            if (content.startsWith("stream_start")) continue;

            finalData += content;
            dispatch(setMarkdown(content));
          }
        }
      }

      const files = extractGeneratedFilesObjectString(finalData);

      if (files) {
        dispatch(setprojectData({ ...files }));
        dispatch(
          setGenerating({
            generating: false,
            generationSuccess: "success",
            isResponseCompleted: true,
          })
        );
      } else {
        dispatch(
          setGenerating({
            generating: false,
            generationSuccess: "failed",
            isResponseCompleted: true,
          })
        );
      }
      dispatch(setEmptyMarkdown(""));
      dispatch(setReaderMode(false));
    } catch (error) {
      dispatch(
        setNotification({
          modalOpen: true,
          status: "error",
          text: "Something went wrong & we are working on it!",
        })
      );
      dispatch(setEmptyMarkdown(""));
      dispatch(setReaderMode(false));
      console.error(error);
    }
  };

  const fetchProjectFiles = async (data: FetchProjectFilesParams) => {
    try {
      const response = await fetch(data.url, {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        dispatch(setprojectData({ ...responseData }));
        dispatch(setReaderMode(false));
        dispatch(
          setGenerating({
            generating: false,
            generationSuccess: "success",
            isResponseCompleted: true,
          })
        );
      } else {
        dispatch(
          setGenerating({
            generating: false,
            generationSuccess: "failed",
            isResponseCompleted: true,
          })
        );
        dispatch(
          setNotification({
            modalOpen: true,
            status: "error",
            text: "Preview is not available at the moment! Please try again.",
          })
        );
      }
    } catch (error) {
      dispatch(
        setNotification({
          modalOpen: true,
          status: "error",
          text: "Failed to fetch project files!",
        })
      );
      console.error(error);
    }
  };

  function extractMessagesObjectString(
    rawMarkdown: string | null | undefined
  ): object | null {
    if (
      !rawMarkdown ||
      typeof rawMarkdown !== "string" ||
      !rawMarkdown.trim()
    ) {
      return null;
    }

    const jsonBlockRegex = /```json\n([\s\S]*?)```/;
    const match = rawMarkdown.match(jsonBlockRegex);
    if (!match) {
      return null;
    }

    const innerContent = match[1].trim();

    try {
      const parsed = JSON.parse(innerContent);
      if (parsed.generatedFiles && typeof parsed.generatedFiles === "object") {
        return parsed.generatedFiles;
      } else {
        return null;
      }
    } catch (e) {
      console.error(
        "extractGeneratedFilesObjectString: Error parsing JSON:",
        e
      );
      return null;
    }
  }

  const sendMessagetoAI = async ({
    message,
  }: {
    message: { role: "ai" | "user"; text: string; image?: string[] };
  }) => {
    try {
      dispatch(setEmptyMarkdown(""));
      dispatch(setReaderMode(false));

      //saving user msg
      dispatch(
        saveMsgToDb({
          text: message.text,
          email: email.value || "",
          projectId: projectId || "",
          role: "user",
          image: imageURLs,
        })
      );

      dispatch(
        setGenerating({
          generating: true,
          isResponseCompleted: true,
          generationSuccess: "thinking",
        })
      );

      const finalData = JSON.stringify({
        userPrompt: message,
        framework,
        csslib,
        memory,
        chatHistory: messages,
        data,
        images: imageURLs,
      });

      dispatch(clearImages());
      dispatch(clearImagesURL());

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: finalData,
      });

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status} ${await response.text()}`
        );
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let finalMakrdown = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        if (typeof chunk === "string") {
          finalMakrdown += chunk;
          dispatch(setMarkdown(chunk));
        }
      }

      const files = extractMessagesObjectString(finalMakrdown);

      if (files) {
        saveMoreDatatoProject({
          data: JSON.stringify({ ...data, ...files }),
          email: email.value || "",
          projectId: projectId || "",
        });

        dispatch(setNewProjectData({ ...files }));
        dispatch(
          setGenerating({
            generating: false,
            generationSuccess: "success",
            isResponseCompleted: true,
          })
        );

        //extracting end message
        const rawString =
          typeof finalMakrdown === "string" ? finalMakrdown : "";
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

        let endMessageContent: string | null = null;
        const hasEndMessageKey = innerContent.includes('"endMessage":');

        if (hasEndMessageKey) {
          const endMessageRegex = /"endMessage":\s*"((?:\\.|[^\\"])*)"/;
          const endMessageMatch = innerContent.match(endMessageRegex);

          if (endMessageMatch && endMessageMatch[1] !== undefined) {
            endMessageContent = decodeJsonString(endMessageMatch[1]);

            handleMessage(endMessageContent);

            // saving ai's msg
            dispatch(
              saveMsgToDb({
                text: endMessageContent,
                email: email.value || "",
                projectId: projectId || "",
                role: "ai",
              })
            );
          } else {
            handleMessage("Done, would you like me to do something else?");
          }
        }
      } else {
        dispatch(
          setGenerating({
            generating: false,
            generationSuccess: "failed",
            isResponseCompleted: true,
          })
        );
      }

      // dispatch(sendaMessage({ role: "ai", text: chunk }));
    } catch (error) {
      console.log(error);
      dispatch(
        setNotification({
          modalOpen: true,
          status: "error",
          text: "Error Generating responsse!",
        })
      );
    }
    dispatch(setEmptyMarkdown(""));
    dispatch(setReaderMode(false));
  };

  const fixWithAI = async () => {
    try {
      dispatch(setEmptyMarkdown(""));
      dispatch(setReaderMode(false));
      dispatch(EmptySheet());

      dispatch(
        setGenerating({
          generating: true,
          isResponseCompleted: true,
          generationSuccess: "thinking",
        })
      );

      if (typeof promptCount === "number" && promptCount > 0) {
        dispatch(setPromptCount(promptCount - 1));
      }

      const finalData = JSON.stringify({
        userPrompt: enh_prompt,
        framework,
        csslib,
        memory,
        chatHistory: messages,
        data,
        images: imageURLs,
      });

      dispatch(clearImages());
      dispatch(clearImagesURL());

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: finalData,
      });

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status} ${await response.text()}`
        );
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let finalMakrdown = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        if (typeof chunk === "string") {
          finalMakrdown += chunk;
          dispatch(setMarkdown(chunk));
        }
      }

      const files = extractMessagesObjectString(finalMakrdown);

      if (files) {
        dispatch(setNewProjectData({ ...files }));
        dispatch(
          setGenerating({
            generating: false,
            generationSuccess: "success",
            isResponseCompleted: true,
          })
        );
      } else {
        dispatch(
          setGenerating({
            generating: false,
            generationSuccess: "failed",
            isResponseCompleted: true,
          })
        );
      }

      // dispatch(sendaMessage({ role: "ai", text: chunk }));
    } catch (error) {
      console.log(error);
      dispatch(
        setNotification({
          modalOpen: true,
          status: "error",
          text: "Error Generating responsse!",
        })
      );
    }
    dispatch(setEmptyMarkdown(""));
    dispatch(setReaderMode(false));
  };

  return {
    genFile,
    fetchProjectFiles,
    extractGeneratedFilesObjectString,
    isGenerating,
    sendMessagetoAI,
    fixWithAI,
  };
};
