"use client";
import React, { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { useAuthenticated } from "@/app/helpers/useAuthenticated";
import { useSettings } from "@/app/helpers/useSettings";
import { GoInfo } from "react-icons/go";
import PricingModal from "@/app/(pages)/_modals/PricingModal";
import { useDispatch } from "react-redux";
import { setPricingModalOpen } from "@/app/redux/reducers/basicData";
import moment from "moment";
import { BsLightningChargeFill } from "react-icons/bs";

const Page = () => {
  const [selectedOption, setSelectedOption] = useState("Account");

  const options = ["Account", "Team"];

  const [showDeploymentsTooltip, setShowDeploymentsTooltip] = useState(false);
  const [showProjectsTooltip, setShowProjectsTooltip] = useState(false);

  const dispatch = useDispatch();
  const { email } = useAuthenticated();
  const { data: settings, isLoading: settingsLoading } = useSettings();

  return (
    <div className="flex flex-col space-y-4">
      <PricingModal />
      {/* options */}
      <div className="flex justify-between items-center">
        <div className="space-x-7 justify-between items-center flex">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => setSelectedOption(option)}
              className={`justify-center items-center flex rounded-lg font-sans font-medium text-xs px-3 py-1 cursor-pointer transition-colors ${selectedOption === option ? "bg-white text-black" : "text-white hover:bg-[#272628]"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedOption}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mt-4 flex"
        >
          {selectedOption === "Account" && (
            <div className="text-white space-y-4 w-full flex flex-col">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {/* Email */}
                <section className="justify-center items-start flex flex-col space-y-7 w-full pb-7">
                  <h2
                    className={`font-bold text-lg font-sans text-white flex justify-center items-center gap-x-2 ${settingsLoading ? "animate-pulse" : ""}`}
                  >
                    {settingsLoading ? (
                      <div className="h-6 w-48 bg-[#272628] rounded animate-pulse"></div>
                    ) : (
                      <div
                        className={`justify-center flex items-center row gap-y-2 md:gap-x-2 ${settings?.plan === "scale" ? "flex-col md:flex-row" : "flex-row space-x-2"}`}
                      >
                        <p className="text-ellipsis inline-block whitespace-nowrap text-balance">
                          {email.value ?? email.value}{" "}
                        </p>

                        <span
                          className={`px-2 gap-x-1 border rounded-md font-sans font-medium justify-center items-center flex text-[10px] ${settings?.plan === "scale" ? "text-white bg-gradient-to-r from-[#7B60F4] to-[#6E63F2] border-[#6A65F2] shadow-[0_0_8px_rgba(123,96,244,0.5)]" : "text-black bg-white border-[#9E9D9F]"}`}
                        >
                          {settings?.plan === "scale" ? "Scale" : "Free"}
                          {settings?.plan === "scale" && (
                            <BsLightningChargeFill />
                          )}
                        </span>
                        {settings?.plan === "scale" &&
                          settings?.daysLeftInSubscription > 0 && (
                            <span className="text-xs text-[#9E9D9F]">
                              ({settings.daysLeftInSubscription} days left)
                            </span>
                          )}
                      </div>
                    )}
                  </h2>
                  <div className="justify-between items-center flex space-x-8 w-full">
                    <div className="relative">
                      <div
                        className={`text-sm font-sans font-medium text-white flex justify-center items-center gap-x-2 ${settingsLoading ? "animate-pulse" : ""}`}
                      >
                        {settingsLoading ? (
                          <div className="h-4 w-32 bg-[#272628] rounded animate-pulse"></div>
                        ) : (
                          <>
                            Deployments - {settings?.deployments ?? 0}
                            <div
                              className="cursor-pointer"
                              onMouseEnter={() =>
                                setShowDeploymentsTooltip(true)
                              }
                              onMouseLeave={() =>
                                setShowDeploymentsTooltip(false)
                              }
                            >
                              <GoInfo />
                              <AnimatePresence>
                                {showDeploymentsTooltip && (
                                  <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="absolute left-full ml-2 p-2 bottom-[1px] z-10 bg-[#28272a] rounded-md text-xs text-white whitespace-nowrap"
                                  >
                                    Number of active deployments
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <div
                        className={`text-sm font-sans font-medium text-white flex justify-center items-center gap-x-2 ${settingsLoading ? "animate-pulse" : ""}`}
                      >
                        {settingsLoading ? (
                          <div className="h-4 w-32 bg-[#272628] rounded animate-pulse"></div>
                        ) : (
                          <>
                            Projects - {settings?.projectCount ?? 0}
                            <div
                              className="cursor-pointer"
                              onMouseEnter={() => setShowProjectsTooltip(true)}
                              onMouseLeave={() => setShowProjectsTooltip(false)}
                            >
                              <GoInfo />
                              <AnimatePresence>
                                {showProjectsTooltip && (
                                  <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="absolute left-full ml-2 p-2 bottom-[1px] z-10 bg-[#28272a] rounded-md text-xs text-white whitespace-nowrap"
                                  >
                                    Number of active projects
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-full space-y-2">
                    <div className="w-full bg-[#272628] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`bg-[#7B60F4] h-full rounded-full transition-all duration-300 ${settingsLoading ? " w-1/2 bg-gradient-to-r from-[#a899ed] via-[#9d93f8] to-[#dedce6] bg-[length:200%_100%] animate-[shimmer_1s_infinite]" : ""}`}
                        style={{
                          width: !settingsLoading
                            ? `${((settings?.promptsUsed ?? 0) / (settings?.maxPrompts ?? 5)) * 100}%`
                            : undefined,
                          animation: settingsLoading
                            ? "shimmer 1s infinite"
                            : undefined,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center w-full">
                      <div
                        className={`text-xs font-sans font-medium text-[#8C8C8C] ${settingsLoading ? "animate-pulse" : ""}`}
                      >
                        {settingsLoading ? (
                          <div className="h-3 w-24 bg-[#272628] rounded animate-pulse"></div>
                        ) : (
                          <>
                            {settings?.promptsUsed ?? 0}/
                            {settings?.maxPrompts ?? 5} prompts used
                          </>
                        )}
                      </div>
                      {settings?.nextPromptReset && !settingsLoading && (
                        <p className="text-xs font-sans font-medium text-[#8C8C8C]">
                          Limit reset monthly at 12:00 AM UTC
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {!settingsLoading && (settings?.remainingPrompts ?? 0) <= 0 && (
                  <p className="text-sm font-sans font-medium text-white my-3 text-balance">
                    Looks like you&rsquo;ve used up your prompts. Let&rsquo;s
                    get you reloaded and back to creating!
                  </p>
                )}
                {!settingsLoading && settings?.plan === "free" ? (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      dispatch(setPricingModalOpen(true));
                    }}
                    className="justify-center items-center flex font-sans py-1 gap-x-1 font-medium text-white bg-[#7163F3] rounded-md hover:bg-[#6a5bf3] text-xs border border-[#6A65F2] cursor-pointer px-2 p-1"
                  >
                    Upgrade to Scale
                  </motion.button>
                ) : (
                  !settingsLoading && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => {
                        dispatch(setPricingModalOpen(true));
                      }}
                      className="justify-center items-center flex font-sans py-1 gap-x-1 font-medium text-gray-200 rounded-md text-xs border border-[#272628] cursor-pointer px-2 p-1"
                    >
                      Renews at{" "}
                      {moment(settings?.subscriptionEndDate).format("DD/MM/YY")}
                    </motion.button>
                  )
                )}
              </motion.div>
            </div>
          )}

          {selectedOption === "Team" && (
            <div className="justify-center items-center flex flex-col space-y-5 w-full h-[40vh]">
              <h3 className="text-lg font-sans font-semibold text-[#9E9D9F]">
                Available Soon
              </h3>
              <p className="text-sm font-sans font-medium text-[#9E9D9F] text-center">
                Invite your team on a project and collaborate in Realtime!
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Page;
