import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as botTemplateService from '@services/botTemplate.service';
import type { BotTemplate, BotTemplateCreate, BotTemplateUpdate } from '../../types/botTemplate.types';

// Define the state interface
export interface BotTemplateState {
  templates: BotTemplate[];
  currentTemplate: BotTemplate | null;
  isLoading: boolean;
  error: string | null;
}

// Define initial state
const initialState: BotTemplateState = {
  templates: [],
  currentTemplate: null,
  isLoading: false,
  error: null
};

// Get all bot templates
export const fetchBotTemplates = createAsyncThunk(
  'botTemplate/fetchTemplates',
  async ({ keyword, skip, limit }: { keyword?: string; skip?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const templates = await botTemplateService.getBotTemplates(keyword, skip, limit);
      return templates;
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch bot templates');
    }
  }
);

// Get a bot template by ID
export const fetchBotTemplateById = createAsyncThunk(
  'botTemplate/fetchTemplateById',
  async (id: string, { rejectWithValue }) => {
    try {
      const template = await botTemplateService.getBotTemplateById(id);
      return template;
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch bot template');
    }
  }
);

// Create a new bot template
export const createBotTemplate = createAsyncThunk(
  'botTemplate/createTemplate',
  async (templateData: BotTemplateCreate, { rejectWithValue }) => {
    try {
      const newTemplate = await botTemplateService.createBotTemplate(templateData);
      return newTemplate;
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Failed to create bot template');
    }
  }
);

// Update a bot template
export const updateBotTemplate = createAsyncThunk(
  'botTemplate/updateTemplate',
  async ({ id, updates }: { id: string; updates: BotTemplateUpdate }, { rejectWithValue }) => {
    try {
      const updatedTemplate = await botTemplateService.updateBotTemplate(id, updates);
      return updatedTemplate;
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Failed to update bot template');
    }
  }
);

// Delete a bot template
export const deleteBotTemplate = createAsyncThunk(
  'botTemplate/deleteTemplate',
  async (id: string, { rejectWithValue }) => {
    try {
      await botTemplateService.deleteBotTemplate(id);
      return id;
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Failed to delete bot template');
    }
  }
);

const botTemplateSlice = createSlice({
  name: 'botTemplate',
  initialState,
  reducers: {
    clearCurrentTemplate: (state) => {
      state.currentTemplate = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all bot templates
      .addCase(fetchBotTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBotTemplates.fulfilled, (state, action: PayloadAction<BotTemplate[]>) => {
        state.isLoading = false;
        state.templates = action.payload;
      })
      .addCase(fetchBotTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch bot template by ID
      .addCase(fetchBotTemplateById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBotTemplateById.fulfilled, (state, action: PayloadAction<BotTemplate>) => {
        state.isLoading = false;
        state.currentTemplate = action.payload;
      })
      .addCase(fetchBotTemplateById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create bot template
      .addCase(createBotTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBotTemplate.fulfilled, (state, action: PayloadAction<BotTemplate>) => {
        state.isLoading = false;
        state.templates.push(action.payload);
        state.currentTemplate = action.payload;
      })
      .addCase(createBotTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update bot template
      .addCase(updateBotTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBotTemplate.fulfilled, (state, action: PayloadAction<BotTemplate>) => {
        state.isLoading = false;
        const index = state.templates.findIndex(template => template._id === action.payload._id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
        state.currentTemplate = action.payload;
      })
      .addCase(updateBotTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete bot template
      .addCase(deleteBotTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBotTemplate.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.templates = state.templates.filter(template => template._id !== action.payload);
        if (state.currentTemplate && state.currentTemplate._id === action.payload) {
          state.currentTemplate = null;
        }
      })
      .addCase(deleteBotTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentTemplate, clearError } = botTemplateSlice.actions;
export default botTemplateSlice.reducer;