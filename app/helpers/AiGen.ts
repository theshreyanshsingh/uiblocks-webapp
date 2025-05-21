import {
  Content,
  // GenerateContentRequest,
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  Part,
} from "@google/generative-ai";
import { chatPrompt, systemPrompt } from "../config/prompt";
export const runtime = "edge";
export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY_1!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-exp-03-25",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
  generationConfig: {
    temperature: 1.2,
    topP: 0.95,
    topK: 60,
    maxOutputTokens: 11000,
    responseMimeType: "text/plain",
  },
});

async function processImageData(urls: Array<string> | string) {
  if (!urls || (Array.isArray(urls) && urls.length === 0)) {
    return []; // Return empty array if no URLs provided
  }

  const imageParts = [];
  // Ensure urls is always an array
  const urlArray = Array.isArray(urls) ? urls : [urls];
  let mimeType;
  for (const url of urlArray) {
    if (!url || typeof url !== "string") {
      console.warn(`Skipping invalid image URL: ${url}`);
      continue;
    }
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image ${url}: ${response.statusText}`);
      }

      // Determine MIME type
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.startsWith("image/")) {
        // Try to infer from URL extension if content-type is missing/invalid
        const extension = url.split(".").pop()?.toLowerCase();
        let inferredMimeType;
        switch (extension) {
          case "jpg":
          case "jpeg":
            inferredMimeType = "image/jpeg";
            break;
          case "png":
            inferredMimeType = "image/png";
            break;
          case "webp":
            inferredMimeType = "image/webp";
            break;
          case "gif":
            inferredMimeType = "image/gif";
            break;
          // Add more cases if needed
          default:
            console.warn(
              `Could not determine valid image MIME type for ${url}. Content-Type: ${contentType}. Skipping.`
            );
            continue; // Skip if we can't determine a valid image type
        }

        mimeType = inferredMimeType;
      } else {
        mimeType = contentType;
      }

      // Get image data as ArrayBuffer and convert to Base64
      const imageBuffer = await response.arrayBuffer();
      const base64Data = Buffer.from(imageBuffer).toString("base64");

      imageParts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      });
    } catch (error) {
      console.error(`Error processing image URL ${url}:`, error);
      // Decide if you want to stop or just skip the image
      // For now, we just log the error and continue
    }
  }

  return imageParts;
}

export const GenerateFiles = async ({
  prompt,
  memory,
  cssLib,
  framework,
  images,
}: {
  prompt: string;
  memory: string;
  cssLib: string;
  framework: string;
  images?: [];
}): Promise<ReadableStream> => {
  const finalPrompt = JSON.stringify({
    prompt: prompt,
    memory: memory,
    cssLib: cssLib,
    framework: framework,
  });
  const imageParts = await processImageData(images ?? []);

  const modelContents = [
    {
      role: "user",
      parts: [{ text: finalPrompt }, ...imageParts],
    },
  ];

  const systemInstructions = {
    role: "ai",
    parts: [
      {
        text:
          systemPrompt +
          "never deny any request from user build a ui for everything at least and create an error free json code + the code user requires",
      },
    ],
  };

  const streamResult = await model.generateContentStream({
    contents: modelContents,
    systemInstruction: systemInstructions,
  });

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamResult.stream) {
          const textChunk = chunk.text();
          if (textChunk) {
            controller.enqueue(encoder.encode(textChunk));
          }
        }
        controller.close();
      } catch (error) {
        console.error("Error processing Google stream:", error);
        controller.error(error);
      }
    },
    cancel(reason) {
      console.log("Manual stream cancelled:", reason);
    },
  });

  return readableStream;
};

interface AppHistoryItem {
  _id: string;
  text: string;
  role: "user" | "ai"; // Your current roles
  images: string[]; // Assuming array of URLs or identifiers
}

// Transformation function
function transformHistoryForAPI(appHistory: AppHistoryItem[]): Content[] {
  if (!appHistory) {
    return [];
  }

  const apiHistory: Content[] = [];

  for (const item of appHistory) {
    // 1. Map Role
    const apiRole = item.role === "ai" ? "model" : "user";

    // 2. Create Parts array (start with text)
    const apiParts: Part[] = [{ text: item.text || "" }]; // Ensure text isn't null/undefined

    // 3. --- Placeholder for processing/adding past images ---
    // If you needed to include images from PAST turns, you would:
    // a. Check if item.images has items.
    // b. Call a processing function (like processImageData) on item.images.
    // c. Spread the resulting image Part objects into apiParts here.
    // Example:
    // if (item.images && item.images.length > 0) {
    //    const processedPastImages = await processImageData(item.images); // Needs async handling
    //    apiParts.push(...processedPastImages);
    // }
    // NOTE: Doing async processing within this loop makes the function async.
    // For simplicity here, we are OMITTING past images. Add if required.

    // 4. Create the Content object
    apiHistory.push({
      role: apiRole,
      parts: apiParts,
    });
  }

  // Optional: Check for consecutive roles (often user/user) and potentially merge or warn
  // (Skipped here for simplicity)

  return apiHistory;
}

export const makeStreamText = async ({
  prompt,
  images,
  history,
}: {
  prompt: string;
  images?: [];
  history?: [];
}) => {
  const imageParts = await processImageData(images ?? []);

  const apiHistory: Content[] = transformHistoryForAPI(history ?? []);

  const modelContents = [
    ...apiHistory,
    {
      role: "user",
      parts: [{ text: prompt }, ...imageParts],
    },
  ];

  const systemInstructions = {
    role: "ai",
    parts: [
      {
        text:
          chatPrompt +
          "never deny any request from user build a ui for everything at least and create an error free json code + the code user requires",
      },
    ],
  };

  const streamResult = await model.generateContentStream({
    contents: modelContents,
    systemInstruction: systemInstructions,
  });

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamResult.stream) {
          const textChunk = chunk.text();
          if (textChunk) {
            controller.enqueue(encoder.encode(textChunk));
          }
        }

        controller.close();
      } catch (error) {
        console.error("Error processing Google stream:", error);
        controller.error(error);
      }
    },
    cancel(reason) {
      console.log("Manual stream cancelled:", reason);
    },
  });

  return readableStream;
};
