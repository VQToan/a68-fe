import type { BacktestProcess, BacktestProcessCreate, BacktestProcessUpdate } from '@/types/backtest.type';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as backtestService from '@services/backtest.service';

// Define the state interface
interface BacktestState {
  processes: BacktestProcess[];
  currentProcess: BacktestProcess | null;
  isLoading: boolean;
  error: string | null;
}

// Define initial state
const initialState: BacktestState = {
  processes: [],
  currentProcess: null,
  isLoading: false,
  error: null
};

// Async thunk for fetching all backtest processes
export const fetchBacktestProcesses = createAsyncThunk(
  'backtest/fetchProcesses',
  async ({ 
    status, 
    skip, 
    limit 
  }: { 
    status?: string; 
    skip?: number; 
    limit?: number 
  }, { rejectWithValue }) => {
    try {
      return await backtestService.getBacktestProcesses(status, skip, limit);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch backtest processes');
    }
  }
);

// Async thunk for fetching a single backtest process by ID
export const fetchBacktestProcessById = createAsyncThunk(
  'backtest/fetchProcessById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await backtestService.getBacktestProcessById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch backtest process');
    }
  }
);

// Async thunk for creating a backtest process
export const createBacktestProcess = createAsyncThunk(
  'backtest/createProcess',
  async (processData: BacktestProcessCreate, { rejectWithValue }) => {
    try {
      return await backtestService.createBacktestProcess(processData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create backtest process');
    }
  }
);

// Async thunk for updating a backtest process
export const updateBacktestProcess = createAsyncThunk(
  'backtest/updateProcess',
  async ({ 
    id, 
    updates 
  }: { 
    id: string; 
    updates: BacktestProcessUpdate 
  }, { rejectWithValue }) => {
    try {
      return await backtestService.updateBacktestProcess(id, updates);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update backtest process');
    }
  }
);

// Async thunk for deleting a backtest process
export const deleteBacktestProcess = createAsyncThunk(
  'backtest/deleteProcess',
  async (id: string, { rejectWithValue }) => {
    try {
      await backtestService.deleteBacktestProcess(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete backtest process');
    }
  }
);

// Async thunk for performing an action on a backtest process
export const performBacktestAction = createAsyncThunk(
  'backtest/performAction',
  async ({ 
    id, 
    action 
  }: { 
    id: string; 
    action: 'run' | 'stop' 
  }, { rejectWithValue }) => {
    try {
      return await backtestService.performBacktestAction(id, action);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || `Failed to ${action} backtest process`);
    }
  }
);

// Create backtest slice
const backtestSlice = createSlice({
  name: 'backtest',
  initialState,
  reducers: {
    clearCurrentProcess: (state) => {
      state.currentProcess = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all backtest processes
      .addCase(fetchBacktestProcesses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBacktestProcesses.fulfilled, (state, action: PayloadAction<BacktestProcess[]>) => {
        state.isLoading = false;
        state.processes = action.payload;
      })
      .addCase(fetchBacktestProcesses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch backtest process by ID
      .addCase(fetchBacktestProcessById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBacktestProcessById.fulfilled, (state, action: PayloadAction<BacktestProcess>) => {
        state.isLoading = false;
        state.currentProcess = action.payload;
      })
      .addCase(fetchBacktestProcessById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create backtest process
      .addCase(createBacktestProcess.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBacktestProcess.fulfilled, (state, action: PayloadAction<BacktestProcess>) => {
        state.isLoading = false;
        state.processes.push(action.payload);
      })
      .addCase(createBacktestProcess.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update backtest process
      .addCase(updateBacktestProcess.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBacktestProcess.fulfilled, (state, action: PayloadAction<BacktestProcess>) => {
        state.isLoading = false;
        const index = state.processes.findIndex(process => process._id === action.payload._id);
        if (index !== -1) {
          state.processes[index] = action.payload;
        }
        state.currentProcess = action.payload;
      })
      .addCase(updateBacktestProcess.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete backtest process
      .addCase(deleteBacktestProcess.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBacktestProcess.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.processes = state.processes.filter(process => process._id !== action.payload);
        if (state.currentProcess && state.currentProcess._id === action.payload) {
          state.currentProcess = null;
        }
      })
      .addCase(deleteBacktestProcess.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Perform action on backtest process
      .addCase(performBacktestAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(performBacktestAction.fulfilled, (state, action: PayloadAction<BacktestProcess>) => {
        state.isLoading = false;
        const index = state.processes.findIndex(process => process._id === action.payload._id);
        if (index !== -1) {
          state.processes[index] = action.payload;
        }
        if (state.currentProcess && state.currentProcess._id === action.payload._id) {
          state.currentProcess = action.payload;
        }
      })
      .addCase(performBacktestAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export reducer actions
export const { clearCurrentProcess, clearError } = backtestSlice.actions;

// Export reducer
export default backtestSlice.reducer;