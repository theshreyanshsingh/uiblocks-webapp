"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthenticated } from "@/app/helpers/useAuthenticated";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { setPricingModalOpen } from "@/app/redux/reducers/basicData";

const PricingModal: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { email } = useAuthenticated();
  const { id } = useSelector((state: RootState) => state.basicData);
  // State and dispatch from Redux store for modal open statu
  const { pricingModalOpen } = useSelector(
    (state: RootState) => state.basicData
  );

  const dispatch = useDispatch();

  const handleUpgrade = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate if we have user email
      if (!email.value) {
        setError("User email not found. Please try again or contact support.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.value,
          id: id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      setError("Failed to process your request. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {pricingModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={() => {
              dispatch(setPricingModalOpen(false));
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#121212] p-6 rounded-lg shadow-lg border border-[#272628] w-full max-w-md z-50"
          >
            {/* Content */}
            <div className="space-y-6">
              <div className="text-left">
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Scale
                </h3>
                <p className="text-[#9E9D9F] text-sm font-sans font-medium">
                  Expand your creative capacity with 40x more prompts
                </p>
              </div>

              {/* Price */}
              <div className="text-left">
                <div className="text-3xl font-bold text-white">
                  $15
                  <span className="text-lg font-normal text-[#9E9D9F] ml-1">
                    /month
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 pl-1">
                <h4 className="text-[#9E9D9F] text-xs font-medium mb-2">
                  BENEFITS
                </h4>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  <span className="text-white text-xs">
                    200 prompts (40x more than Free plan)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  <span className="text-white text-xs">
                    Priority customer support with faster response times
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  <span className="text-white text-xs">Unlimited projects</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  <span className="text-white text-xs">
                    Access to early features
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center  gap-3">
                <span className="text-[#9E9D9F] text-xs">
                  Then unlimited extra prompts for $10/250 prompts
                </span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-xs text-center">{error}</div>
              )}

              {/* Upgrade Button */}
              <motion.button
                onClick={handleUpgrade}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                transition={{ duration: 0.2 }}
                disabled={isLoading}
                className={`w-full font-medium py-2 rounded-md transition-all duration-200 text-sm font-sans flex justify-center items-center ${isLoading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white text-black hover:bg-gray-100"}`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Continue to Scale"
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PricingModal;
