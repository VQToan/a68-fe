import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as moduleBotService from '@services/moduleBots.service';
import type { IModuleBot, ModuleBotCreate, ModuleBotUpdate } from '@services/moduleBots.service';

// Define the module state interface
export interface ModuleState {
  modules: IModuleBot[];
  currentModule: IModuleBot | null;
  isLoading: boolean;
  error: string | null;
}

// Initialize the module state
const initialState: ModuleState = {
  modules: [],
  currentModule: null,
  isLoading: false,
  error: null,
};

// Get all module bots
export const fetchModules = createAsyncThunk(
  'module/fetchModules',
  async ({ keyword, skip, limit }: { keyword?: string; skip?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const modules = await moduleBotService.getModuleBots(keyword, skip, limit);
      return modules;
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch modules');
    }
  }
);

// Get a module bot by ID
export const fetchModuleById = createAsyncThunk(
  'module/fetchModuleById',
  async (id: string, { rejectWithValue }) => {
    try {
      const module = await moduleBotService.getModuleBotById(id);
      return module;
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch module');
    }
  }
);

// Get a module bot by source name
export const fetchModuleBySourceName = createAsyncThunk(
  'module/fetchModuleBySourceName',
  async (nameInSource: string, { rejectWithValue }) => {
    try {
      const module = await moduleBotService.getModuleBotBySourceName(nameInSource);
      return module;
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch module');
    }
  }
);

// Create a new module bot
export const createModule = createAsyncThunk(
  'module/createModule',
  async (moduleData: ModuleBotCreate, { rejectWithValue }) => {
    try {
      const newModule = await moduleBotService.createModuleBot(moduleData);
      return newModule;
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Failed to create module');
    }
  }
);

// Update a module bot
export const updateModule = createAsyncThunk(
  'module/updateModule',
  async ({ id, updates }: { id: string; updates: ModuleBotUpdate }, { rejectWithValue }) => {
    try {
      const updatedModule = await moduleBotService.updateModuleBot(id, updates);
      return updatedModule;
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Failed to update module');
    }
  }
);

// Delete a module bot
export const deleteModule = createAsyncThunk(
  'module/deleteModule',
  async (id: string, { rejectWithValue }) => {
    try {
      await moduleBotService.deleteModuleBot(id);
      return id;
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Failed to delete module');
    }
  }
);

const moduleSlice = createSlice({
  name: 'module',
  initialState,
  reducers: {
    clearCurrentModule: (state) => {
      state.currentModule = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch modules cases
      .addCase(fetchModules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action: PayloadAction<IModuleBot[]>) => {
        state.isLoading = false;
        state.modules = action.payload;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch module by ID cases
      .addCase(fetchModuleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModuleById.fulfilled, (state, action: PayloadAction<IModuleBot>) => {
        state.isLoading = false;
        state.currentModule = action.payload;
      })
      .addCase(fetchModuleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch module by source name cases
      .addCase(fetchModuleBySourceName.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModuleBySourceName.fulfilled, (state, action: PayloadAction<IModuleBot>) => {
        state.isLoading = false;
        state.currentModule = action.payload;
      })
      .addCase(fetchModuleBySourceName.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create module cases
      .addCase(createModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createModule.fulfilled, (state, action: PayloadAction<IModuleBot>) => {
        state.isLoading = false;
        state.modules.push(action.payload);
      })
      .addCase(createModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update module cases
      .addCase(updateModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateModule.fulfilled, (state, action: PayloadAction<IModuleBot>) => {
        state.isLoading = false;
        const index = state.modules.findIndex(module => module._id === action.payload._id);
        if (index !== -1) {
          state.modules[index] = action.payload;
        }
        if (state.currentModule && state.currentModule._id === action.payload._id) {
          state.currentModule = action.payload;
        }
      })
      .addCase(updateModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete module cases
      .addCase(deleteModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteModule.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.modules = state.modules.filter(module => module._id !== action.payload);
        if (state.currentModule && state.currentModule._id === action.payload) {
          state.currentModule = null;
        }
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentModule, clearError } = moduleSlice.actions;
export default moduleSlice.reducer;