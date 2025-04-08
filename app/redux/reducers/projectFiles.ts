import { createSlice } from "@reduxjs/toolkit";

interface ProjectFilesState {
  files: string | null;
  markdown: string | null;
  filesLoaded: boolean;
  data: object | null;
}

const initialState: ProjectFilesState = {
  files: null,
  markdown: "",
  filesLoaded: false,
  data: null,
};

const projectFilesSlice = createSlice({
  name: "projectFiles",
  initialState,
  reducers: {
    setprojectFiles: (state, action) => {
      state.files = action.payload;
    },
    setprojectData: (state, action) => {
      state.data = action.payload;
    },
    setNewProjectData: (state, action) => {
      state.data = {
        ...state.data, // Keep existing data
        ...action.payload, // Merge new data on top
      };
    },
    setMarkdown: (state, action) => {
      state.markdown += action.payload;
    },
    setEmptyMarkdown: (state, action) => {
      state.markdown = action.payload;
    },
    EmptySheet: () => initialState,
  },
});

export const {
  setprojectFiles,
  setMarkdown,
  setEmptyMarkdown,
  setprojectData,
  setNewProjectData,
  EmptySheet,
} = projectFilesSlice.actions;
export default projectFilesSlice.reducer;
