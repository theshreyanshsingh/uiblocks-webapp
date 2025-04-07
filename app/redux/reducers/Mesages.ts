import { API } from "@/app/config/Config";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  role: string;
  text: string;
  images?: string[];
}

interface MessagesState {
  messages: Message[];
  msgLoading: "loading" | "success" | "error" | null;
}

// Initial state is empty
const initialState: MessagesState = {
  messages: [],
  msgLoading: null,
};

export const saveMsgToDb = createAsyncThunk(
  "messages/saveMsgToDb",
  async ({
    text,
    email,
    projectId,
    role,
    image,
  }: {
    text: string;
    email: string;
    projectId: string;
    role: string;
    image?: string[];
  }) => {
    try {
      const url = `${API}/save-message`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, email, projectId, role, image }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return "success";
    } catch (error: unknown) {
      console.log(error);
      return "error";
    }
  }
);

// Create the slice
const messagesProvider = createSlice({
  name: "messagesprovider",
  initialState,
  reducers: {
    setmessages: (state, action: PayloadAction<{ messages: Message[] }>) => {
      state.messages = action.payload.messages; // Ensure correct structure
    },
    sendaMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(saveMsgToDb.pending, (state) => {
      state.msgLoading = "loading";
    });
    builder.addCase(saveMsgToDb.fulfilled, (state) => {
      state.msgLoading = "success";
    });
    builder.addCase(saveMsgToDb.rejected, (state) => {
      state.msgLoading = "error";
    });
  },
});

export const { setmessages, sendaMessage } = messagesProvider.actions;
export default messagesProvider.reducer;
