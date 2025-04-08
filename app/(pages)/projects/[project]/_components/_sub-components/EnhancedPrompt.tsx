"use client";
import { setNotification } from "@/app/redux/reducers/NotificationModalReducer";

import { useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { useDispatch } from "react-redux";

import { useAuthenticated } from "@/app/helpers/useAuthenticated";
import { useGenerateFile } from "@/app/_services/useGenerateFile";

// const extractProjectDetails = (description: string) => {
//   // Function to extract different sections using regex
//   const extractSection = (label: string, nextLabel: string) => {
//     const regex = new RegExp(
//       `${label}:\\s*\\n\\s*([\\s\\S]*?)(?=\\n\\s*${nextLabel}:|$)`,
//       "i"
//     );
//     const match = description.match(regex);
//     return match ? match[1].trim() : "";
//   };

//   // Extract sections
//   const projectSummary = extractSection("Project Summary", "Features");
//   const featuresText = extractSection("Features", "Memory Enhancement");
//   const memoryEnhancement = extractSection("Memory Enhancement", "Theme");
//   const theme = extractSection("Theme", "END");

//   // Process features into an array (removes leading numbers and dots)
//   const features = featuresText
//     ? featuresText
//         .split(/\n\s*\d+\.?\s*/) // Matches numbers (1, 2, etc.), optional dot, and spaces
//         .map((item) => item.replace(/^\d+\.?\s*/, "").trim()) // Ensures any leftover numbering is removed
//         .filter(Boolean)
//     : [];

//   return {
//     projectSummary,
//     features,
//     memoryEnhancement,
//     theme,
//   };
// };

const EnhancedPrompt = ({
  enh_prompt,
  projectId,
}: {
  enh_prompt: string;
  projectId: string;
}) => {
  const initialDetails = JSON.parse(enh_prompt);

  const dispatch = useDispatch();

  const { email } = useAuthenticated();

  const { genFile } = useGenerateFile();

  const [isEditing, setIsEditing] = useState(false);
  const [projectSummary, setProjectSummary] = useState(initialDetails.summary);
  const [features, setFeatures] = useState<string[]>(
    initialDetails.features || []
  );
  const [memoryEnhancement, setMemoryEnhancement] = useState(
    initialDetails.memoryEnhancement
  );
  const [theme, setTheme] = useState(initialDetails.theme);

  if (!enh_prompt) return null;

  const handleAddFeature = () => {
    setFeatures([...features, ""]);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...features];
    updatedFeatures[index] = value;
    setFeatures(updatedFeatures);
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = features.filter((_, i) => i !== index);
    setFeatures(updatedFeatures);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // Validate inputs
    if (!projectSummary.trim()) {
      alert("Project Summary cannot be empty");
      return;
    }

    if (features.some((feature) => !feature.trim())) {
      alert("Features cannot be empty");
      return;
    }

    if (!memoryEnhancement.trim()) {
      alert("Memory cannot be empty");
      return;
    }

    if (!theme.trim()) {
      alert("theme cannot be empty");
      return;
    }

    // Save logic would go here
    setIsEditing(false);
  };

  const handleStart = async () => {
    try {
      if (!projectSummary.trim()) {
        dispatch(
          setNotification({
            modalOpen: true,
            status: "error",
            text: "Project Summary cannot be empty",
          })
        );
        return;
      }

      if (features.some((feature) => !feature.trim())) {
        dispatch(
          setNotification({
            modalOpen: true,
            status: "error",
            text: "Features cannot be empty",
          })
        );
        return;
      }

      if (!memoryEnhancement.trim()) {
        dispatch(
          setNotification({
            modalOpen: true,
            status: "error",
            text: "Memory cannot be empty",
          })
        );

        return;
      }

      if (!theme.trim()) {
        dispatch(
          setNotification({
            modalOpen: true,
            status: "error",
            text: "Theme cannot be empty",
          })
        );

        return;
      }

      genFile({ email: email.value || "", projectId, input: enh_prompt });
    } catch (error) {
      console.log(error);
      dispatch(
        setNotification({
          modalOpen: true,
          status: "error",
          text: "Something went wrong!",
        })
      );
    }
  };

  return (
    <div className="relative flex justify-center items-center bg-opacity-50 w-full h-full">
      <div className="absolute transform -translate-y-1/2 top-1/2 space-y-3">
        <h3 className="text-lg font-semibold">Enhanced Prompt</h3>
        <div className="max-md:w-[80vw] md:w-[50vw] h-[50vh] overflow-y-auto bg-[#252527] p-6 rounded-lg shadow-lg text-white font-sans font-medium">
          <h4 className="text-sm font-medium underline mb-2">
            Project Summary
          </h4>
          {isEditing ? (
            <textarea
              value={projectSummary}
              onChange={(e) => setProjectSummary(e.target.value)}
              className="w-full bg-[#4a494e] p-2 rounded text-white text-sm mb-3 focus:outline-none"
              rows={2}
            />
          ) : (
            <p className="text-sm mb-3">{projectSummary}</p>
          )}

          <h4 className="text-sm font-medium underline mb-2">Features</h4>
          {isEditing ? (
            <div className="mb-3">
              {features &&
                features.length > 0 &&
                features.map((feature, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      value={feature}
                      onChange={(e) =>
                        handleFeatureChange(index, e.target.value)
                      }
                      className="flex-grow bg-[#4a494e] p-2 rounded text-white text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => handleRemoveFeature(index)}
                      className="ml-2 px-2 text-red-500 rounded text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              <button
                onClick={handleAddFeature}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
              >
                Add Feature
              </button>
            </div>
          ) : (
            <ul className="list-disc list-inside text-sm mb-3">
              {features &&
                features.length > 0 &&
                features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
            </ul>
          )}

          <h4 className="text-sm font-medium underline mb-2">
            Memory Enhancement
          </h4>
          {isEditing ? (
            <textarea
              value={memoryEnhancement}
              onChange={(e) => setMemoryEnhancement(e.target.value)}
              className="w-full bg-[#4a494e] p-2 rounded text-white text-sm mb-3 focus:outline-none"
              rows={3}
            />
          ) : (
            <p className="text-sm mb-3">{memoryEnhancement}</p>
          )}

          <h4 className="text-sm font-medium underline mb-2">Theme</h4>
          {isEditing ? (
            <textarea
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-[#4a494e] p-2 rounded text-white text-sm focus:outline-none"
              rows={3}
            />
          ) : (
            <p className="text-sm whitespace-pre-line">{theme}</p>
          )}
        </div>

        <div className="justify-end flex items-center space-x-5">
          <button
            onClick={toggleEdit}
            className="text-white font-sans font-medium text-xs cursor-pointer"
          >
            {isEditing ? null : "Edit"}
          </button>
          <button
            onClick={isEditing ? handleSave : handleStart}
            className="cursor-pointer bg-white text-black hover:bg-gray-50 rounded-md px-3 p-1 gap-x-1 justify-center items-center flex font-sans font-medium text-xs"
          >
            {isEditing ? "Save Changes" : "Start Building"}
            {isEditing ? null : <FaCheck className="text-xs" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPrompt;
