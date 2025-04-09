import { API } from "@/app/config/Config";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setmessages } from "./Mesages";
import { clearImagesURL, setId, setPlan } from "./basicData";

interface FetchProjectParams {
  string: string;
}

export const fetchProject = createAsyncThunk<
  {
    title: string;
    projectId: string;
    input: string;
    csslib: string;
    framework: string;
    memory: string;
    isResponseCompleted: boolean;
    url: string;
    lastResponder: "ai" | "user";
    enh_prompt: string;
    promptCount: number;
  },
  FetchProjectParams
>("projectOptions/fetchProject", async ({ string: requestBody }, thunkAPI) => {
  try {
    const url = `${API}/build-project`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    thunkAPI.dispatch(setmessages({ messages: data.messages }));
    thunkAPI.dispatch(setPlan(data.plan));
    thunkAPI.dispatch(clearImagesURL());
    thunkAPI.dispatch(setId(data.id));

    if (!data.url) {
      thunkAPI.dispatch(setGenerationSuccess(null));
    }

    return {
      title: data.title,
      projectId: data.projectId,
      input: data.input,
      csslib: data.csslib,
      framework: data.framework,
      memory: data.memory,
      url: data.url,
      lastResponder: data.lastResponder,
      isResponseCompleted: data.isResponseCompleted,
      enh_prompt: data.enh_prompt,
      promptCount: data.promptCount,
    };
  } catch (error: unknown) {
    return thunkAPI.rejectWithValue(error);
  }
});

interface PlanState {
  fullscreen: boolean;
  mode: "edit" | "split" | "code";
  responsive: "desktop" | "mobile";
  loading: "loading" | "done" | "error" | null;
  title: string | null;
  projectId: string | null;
  framework: string | null;
  input: string | null;
  memory: string | null;
  csslib: string | null;
  generating: boolean;
  readerMode: boolean;
  url: string | null;
  lastResponder: "ai" | "user" | null;
  isResponseCompleted: boolean | null;
  enh_prompt: string | null;
  generationSuccess: null | "success" | "failed" | "thinking";
  memoryModal: boolean;
  promptCount: number | null;
}

// Initial state is empty
const initialState: PlanState = {
  fullscreen: false,
  mode: "edit",
  responsive: "desktop",
  loading: null,
  title: null,
  projectId: null,
  generating: true,
  readerMode: false,
  framework: null,
  input: null,
  memory: null,
  csslib: null,
  url: null,
  lastResponder: null,
  isResponseCompleted: null,
  enh_prompt: null,
  generationSuccess: null,
  memoryModal: false,
  promptCount: null,
};

// Create the slice
const projectOptions = createSlice({
  name: "projectoptions",
  initialState,
  reducers: {
    clearUrlAndPrompt: (state) => {
      return {
        ...state,
        url: null,
        enh_prompt: null,
      };
    },
    setprojectOptions: (state, action: PayloadAction<PlanState>) => {
      return {
        ...state,
        fullscreen: action.payload.fullscreen,
        mode: action.payload.mode,
        responsive: action.payload.responsive,
      };
    },
    setPromptCount: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        promptCount: action.payload,
      };
    },
    setGenerationSuccess: (
      state,
      action: PayloadAction<"success" | "thinking" | "failed" | null>
    ) => {
      return {
        ...state,
        generationSuccess: action.payload,
      };
    },
    setMemory: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        memory: action.payload,
      };
    },
    setMemoryModal: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        memoryModal: action.payload,
      };
    },
    setprojectDetails: (state, action: PayloadAction<PlanState>) => {
      return {
        ...state,
        input: action.payload.input,
        memory: action.payload.memory,
        csslib: action.payload.csslib,
        framework: action.payload.framework,
      };
    },
    setProjectMode: (
      state,
      action: PayloadAction<{ mode: "edit" | "split" | "code" }>
    ) => {
      return {
        ...state,
        mode: action.payload.mode,
      };
    },
    setReaderMode: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        readerMode: action.payload,
      };
    },
    setResponsivess: (
      state,
      action: PayloadAction<{ responsive: "desktop" | "mobile" }>
    ) => {
      return {
        ...state,
        responsive: action.payload.responsive,
      };
    },
    setFullscreen: (state, action: PayloadAction<{ fullscreen: boolean }>) => {
      return {
        ...state,
        fullscreen: action.payload.fullscreen,
      };
    },
    setGenerating: (
      state,
      action: PayloadAction<{
        generating: boolean;
        isResponseCompleted?: boolean;
        generationSuccess?: "success" | "failed" | "thinking" | null;
      }>
    ) => {
      return {
        ...state,
        generating: action.payload.generating,
        isResponseCompleted: action.payload.isResponseCompleted ?? null,
        generationSuccess: action.payload.generationSuccess ?? null,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProject.pending, (state) => {
      state.loading = "loading";
    });
    builder.addCase(
      fetchProject.fulfilled,
      (
        state,
        action: PayloadAction<{
          title: string;
          projectId: string;
          input: string;
          csslib: string;
          framework: string;
          memory: string;
          isResponseCompleted: boolean;
          url: string;
          lastResponder: "ai" | "user";
          enh_prompt: string;
          promptCount: number | null;
        }>
      ) => {
        state.url = null; //previous url should be null
        state.loading = "done";
        state.title = action.payload.title;
        state.projectId = action.payload.projectId;
        state.framework = action.payload.framework;
        state.input = action.payload.input;
        state.csslib = action.payload.csslib;
        state.memory = action.payload.memory;
        state.url = action.payload.url;
        state.lastResponder = action.payload.lastResponder;
        state.isResponseCompleted = action.payload.isResponseCompleted;
        state.enh_prompt = action.payload.enh_prompt;
        state.promptCount = action.payload.promptCount;
      }
    );
    builder.addCase(fetchProject.rejected, (state) => {
      state.loading = "error";
    });
  },
});

export const {
  setprojectOptions,
  setMemory,
  setMemoryModal,
  setProjectMode,
  setResponsivess,
  setGenerating,
  setFullscreen,
  setReaderMode,
  setprojectDetails,
  setPromptCount,
  clearUrlAndPrompt,
  setGenerationSuccess,
} = projectOptions.actions;
export default projectOptions.reducer;
