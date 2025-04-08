"use client";

import { useRef } from "react";
import { API } from "../config/Config";

type UseSubscriptionCheckProps = {
  isAuthenticated: boolean;
  email: string;
};

export function useSubscriptionCheck({
  isAuthenticated,
  email,
}: UseSubscriptionCheckProps) {
  const needsUpgradeRef = useRef<boolean | null>(null);

  const checkSubscriptionStatus = async () => {
    if (!isAuthenticated || !email) return needsUpgradeRef.current;

    try {
      const response = await fetch(`${API}/sub-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subscription status");
      }

      const data = await response.json();

      // Check if prompt count is 0 and plan is free
      const upgradeNeeded = data.promptCount === 0;

      // Store in ref for persistence
      needsUpgradeRef.current = upgradeNeeded;

      return upgradeNeeded;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false;
    }
  };

  return { needsUpgrade: needsUpgradeRef.current, checkSubscriptionStatus };
}
