"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import {
  clearUrlAndPrompt,
  fetchProject,
  setGenerationSuccess,
} from "@/app/redux/reducers/projectOptions";
import { EmptySheet } from "@/app/redux/reducers/projectFiles";
import { useAuthenticated } from "./useAuthenticated";
import { usePathname } from "next/navigation";

/**
 * Custom hook to fetch and manage project data efficiently
 * Prevents multiple fetches when component re-renders
 */
export function useProject() {
  const { isAuthenticated, email } = useAuthenticated();
  const { loading, projectId: currentProjectId } = useSelector(
    (state: RootState) => state.projectOptions
  );
  const { imageURLs } = useSelector((state: RootState) => state.basicData);

  const dispatch: AppDispatch = useDispatch();
  const path = usePathname();

  // Use a ref to track if we've already fetched this project
  const fetchedRef = useRef<string | null>(null);

  const getProjectId = useCallback(() => {
    const segments = path.split("/");
    return segments[2] || "";
  }, [path]);

  // Function to fetch project data
  const fetchProjectData = useCallback(() => {
    const projectId = getProjectId();

    // Skip if already fetched this project or no authentication
    if (
      !projectId ||
      !isAuthenticated.value ||
      fetchedRef.current === projectId ||
      (currentProjectId === projectId && loading === "done")
    ) {
      return;
    }

    // Update ref to prevent duplicate fetches
    fetchedRef.current = projectId;

    const rawString = JSON.stringify({
      input: sessionStorage.getItem("input") || "",
      memory: sessionStorage.getItem("memory") || "",
      cssLibrary: sessionStorage.getItem("css") || "",
      framework: sessionStorage.getItem("framework") || "",
      projectId: projectId,
      owner: email.value || "",
      images: imageURLs,
    });

    dispatch(fetchProject({ string: rawString }));
  }, [
    path,
    isAuthenticated.value,
    email.value,
    imageURLs,
    dispatch,
    loading,
    currentProjectId,
    getProjectId,
  ]);

  // Reset the fetchedRef when path changes
  useEffect(() => {
    const projectId = getProjectId();
    if (fetchedRef.current !== projectId) {
      fetchedRef.current = null;
    }
  }, [path, getProjectId]);

  // Initial fetch
  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // Cleanup function when component unmounts or projectId changes
  useEffect(() => {
    const projectId = getProjectId();

    // Return cleanup function
    return () => {
      // Only run cleanup when navigating away from a project
      if (projectId) {
        // Clear url and enh_prompt before making the request
        dispatch(clearUrlAndPrompt());
        dispatch(setGenerationSuccess(null));
        dispatch(EmptySheet());
      }
    };
  }, [getProjectId, dispatch]);

  return {
    fetchProjectData,
    loading,
    projectId: currentProjectId,
  };
}
