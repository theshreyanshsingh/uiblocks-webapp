import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { FiCode, FiLayout } from "react-icons/fi";
import { TiPen } from "react-icons/ti";
import { setProjectMode } from "@/app/redux/reducers/projectOptions";
import { RootState } from "@/app/redux/store";
import { setNotification } from "@/app/redux/reducers/NotificationModalReducer";

const Switcher = () => {
  const dispatch = useDispatch();

  const allowedModes = ["edit", "code", "split"];

  const { mode, generationSuccess } = useSelector(
    (state: RootState) => state.projectOptions
  );

  const options = [
    { id: "edit", icon: <TiPen className="text-lg" />, label: "Edit" },
    { id: "code", icon: <FiCode className="text-lg" />, label: "Code" },
    { id: "split", icon: <FiLayout className="text-lg" />, label: "Split" },
  ];

  const MobileOptions = [
    { id: "edit", icon: <TiPen className="text-lg" />, label: "Edit" },
    { id: "code", icon: <FiCode className="text-lg" />, label: "Code" },
  ];

  // swtcih btwn code, split and edit
  const handleMode = async (id: "edit" | "code" | "split") => {
    try {
      if (allowedModes.includes(id)) {
        dispatch(setProjectMode({ mode: id }));
      } else {
        console.error(`Invalid mode: ${id}`);
      }
    } catch (error) {
      dispatch(
        setNotification({
          modalOpen: true,
          status: "error",
          text: "There is an issue while saving the code!",
        })
      );
      console.log(error);
    }
  };

  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative flex bg-[#252525] rounded-md w-fit shadow-lg z-10">
      {/* Desktop switcher */}
      <div className="justify-center items-center md:flex hidden">
        {options.map((option, index) => (
          <React.Fragment key={option.id}>
            <button
              onMouseEnter={() =>
                generationSuccess !== "success" && setHovered(true)
              }
              onMouseLeave={() => setHovered(false)}
              onClick={() => {
                if (generationSuccess === "success") {
                  handleMode(option.id as "edit" | "split" | "code");
                }
              }}
              className={`relative flex items-center justify-center px-3 py-1 transition-all duration-200 z-10 ${
                mode === option.id
                  ? "text-black bg-white rounded-md"
                  : "text-white hover:text-[#BA51CC]"
              }`}
            >
              {option.icon}
            </button>
            {index < options.length - 1 && (
              <div className="w-px h-3 bg-[#FFFFFF]/30 self-center" />
            )}
          </React.Fragment>
        ))}
      </div>
      {/* Mobile switcher */}
      <div className="justify-center items-center flex md:hidden">
        {MobileOptions.map((option, index) => (
          <React.Fragment key={index}>
            <button
              onMouseEnter={() =>
                generationSuccess !== "success" && setHovered(true)
              }
              onMouseLeave={() => setHovered(false)}
              onClick={() => {
                if (generationSuccess === "success") {
                  handleMode(option.id as "edit" | "code");
                }
              }}
              className={`relative flex items-center justify-center px-3 py-1 transition-all duration-200 z-10 ${
                mode === option.id
                  ? "text-black bg-white rounded-md"
                  : "text-white hover:text-[#BA51CC]"
              }`}
            >
              {option.icon}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Tooltip appears only on hover */}

      <AnimatePresence>
        {generationSuccess !== "success" && hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-10 z-50 left-1/2 transform -translate-x-1/2 justify-center items-center flex bg-white text-black text-xs font-medium px-3 py-2 rounded-md shadow-lg min-w-max max-w-sm whitespace-normal"
          >
            Switch between editor, preview, and split mode once the code is
            ready.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Switcher;
