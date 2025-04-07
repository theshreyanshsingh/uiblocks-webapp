import { useState, useEffect, useRef } from "react";
import { useAuthenticated } from "./useAuthenticated";
import { API } from "../config/Config";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setId, setPlan } from "../redux/reducers/basicData";

interface SettingsData {
  email: string;
  plan: "free" | "scale";
  subscriptionStatus?: string;
  promptsUsed: number;
  remainingPrompts: number;
  maxPrompts: number;
  subscriptionEndDate?: string;
  daysLeftInSubscription: number;
  nextPromptReset?: string;
  deployments: number;
  projectCount: number;
}

export const useSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SettingsData | null>(null);
  const { email } = useAuthenticated();
  const fetchedRef = useRef(false);
  const { id } = useSelector((state: RootState) => state.basicData);
  const dispatch = useDispatch();

  const fetchSettings = async () => {
    if (!email.value) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.value, id }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const { success, user } = await response.json();

      if (!success) {
        throw new Error("Failed to fetch settings");
      }

      setData(user);
      dispatch(setId(user.id));
      dispatch(setPlan(user.plan));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (email.value && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchSettings();
    }
  }, [email.value]);

  return { data, isLoading, error };
};
