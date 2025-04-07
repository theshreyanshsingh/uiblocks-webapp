"use client";

import React, { useMemo, useEffect, useState } from "react";
import { SandpackPreview } from "@codesandbox/sandpack-react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { motion, Variants } from "framer-motion";

type ResponsiveMode = "mobile" | "tablet" | "desktop" | "fullscreen";

// Define base styles
const responsiveStyles: Record<
  ResponsiveMode,
  { width: string; height: string }
> = {
  mobile: { width: "375px", height: "667px" },
  tablet: { width: "30vw", height: "95%" },
  desktop: { width: "70vw", height: "95%" },
  fullscreen: { width: "100%", height: "95%" },
};

const smallScreenOverrides: Partial<
  Record<ResponsiveMode, { width: string; height: string }>
> = {
  desktop: { width: "95vw", height: "45vh" }, // Wider and shorter desktop for mobile screen
};

// Define motion variants
const previewVariants: Variants = {
  mobile: {
    width: responsiveStyles.mobile.width,
    height: responsiveStyles.mobile.height,
  },
  tablet: {
    width: responsiveStyles.tablet.width,
    height: responsiveStyles.tablet.height,
  },
  desktop: {
    width: responsiveStyles.desktop.width,
    height: responsiveStyles.desktop.height,
  },
  fullscreen: {
    width: responsiveStyles.fullscreen.width,
    height: responsiveStyles.fullscreen.height,
  },
  desktop_on_small_screen: {
    width: smallScreenOverrides.desktop!.width,
    height: smallScreenOverrides.desktop!.height,
  },
};

const useIsSmallScreen = () => {
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const update = () => setIsSmall(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return isSmall;
};

const Canvas = () => {
  const { responsive } = useSelector(
    (state: RootState) => state.projectOptions
  );
  const isSmallScreen = useIsSmallScreen();

  const currentMode = useMemo(() => {
    if (
      isSmallScreen &&
      responsive === "desktop" &&
      previewVariants["desktop_on_small_screen"]
    ) {
      return "desktop_on_small_screen" as const;
    }

    if (responsive && previewVariants[responsive as ResponsiveMode]) {
      return responsive as ResponsiveMode;
    }

    return "fullscreen" as const;
  }, [responsive, isSmallScreen]);

  return (
    <div className="bg-[#0F0F0F] h-[97%] overflow-hidden flex justify-center items-center">
      <motion.div
        className="shadow-lg overflow-hidden h-full rounded-md relative scrollbar-hide"
        variants={previewVariants}
        animate={currentMode}
        initial={false}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          ease: "fadeInOut",
          duration: 0.1,
        }}
      >
        <SandpackPreview
          onError={(e) => {
            console.log("error occured canvas", e);
          }}
          className="h-full border-none bg-transparent rounded-none scrollbar-hide"
          showNavigator={false}
          showOpenInCodeSandbox={false}
          showRestartButton={false}
          showRefreshButton={false}
          contentEditable
          suppressHydrationWarning
          suppressContentEditableWarning
        />
      </motion.div>
    </div>
  );
};

export default Canvas;
