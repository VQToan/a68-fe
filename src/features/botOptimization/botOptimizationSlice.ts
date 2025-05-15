import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as botOptimizationService from "@/services/botOptimization.service";
import type { 
  BotOptimizationRequest, 
  BotOptimizationResponse, 
  OptimizationState,
  LLMModel
} from "@/types/botOptimization.type";

// Initial state
const initialState: OptimizationState & {
  availableModels: LLMModel[];
  isLoadingModels: boolean;
} = {
  optimizationResults: null,
  isLoading: false,
  error: null,
  availableModels: [],
  isLoadingModels: false,
};

// Async thunk for optimizing a bot
export const optimizeBot = createAsyncThunk(
  "botOptimization/optimize",
  async (requestData: BotOptimizationRequest, { rejectWithValue }) => {
    try {
      return await botOptimizationService.optimizeBot(requestData);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to optimize bot"
      );
    }
  }
);

// Async thunk for fetching available models
export const fetchAvailableModels = createAsyncThunk(
  "botOptimization/fetchModels",
  async ({ provider, apiKey }: { provider: string; apiKey: string }, { rejectWithValue }) => {
    try {
      return await botOptimizationService.getAvailableModels(provider, apiKey);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to fetch available models"
      );
    }
  }
);

// Create the slice
const botOptimizationSlice = createSlice({
  name: "botOptimization",
  initialState,
  reducers: {
    clearResults: (state) => {
      state.optimizationResults = null;
      state.error = null;
    },
    clearModels: (state) => {
      state.availableModels = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Optimize bot
      .addCase(optimizeBot.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        optimizeBot.fulfilled,
        (state, action: PayloadAction<BotOptimizationResponse>) => {
          state.isLoading = false;
          state.optimizationResults = action.payload;
        }
      )
      .addCase(optimizeBot.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch models
      .addCase(fetchAvailableModels.pending, (state) => {
        state.isLoadingModels = true;
        state.error = null;
      })
      .addCase(
        fetchAvailableModels.fulfilled,
        (state, action: PayloadAction<{ provider: string; models: LLMModel[] }>) => {
          state.isLoadingModels = false;
          state.availableModels = action.payload.models;
        }
      )
      .addCase(fetchAvailableModels.rejected, (state, action) => {
        state.isLoadingModels = false;
        state.error = action.payload as string;
        state.availableModels = [];
      });
  },
});

// Export actions
export const { clearResults, clearModels } = botOptimizationSlice.actions;

// Export reducer
export default botOptimizationSlice.reducer;