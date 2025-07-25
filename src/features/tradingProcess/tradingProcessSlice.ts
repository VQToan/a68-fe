import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import * as tradingProcessService from '@services/tradingProcess.service';
import type { 
  TradingProcess, 
  TradingProcessCreate, 
  TradingProcessUpdate,
  TradingProcessPaginatedResponse,
  TradingStatusType 
} from '@/types/trading.types';

// Async thunks

export const fetchTradingProcesses = createAsyncThunk(
  'tradingProcess/fetchTradingProcesses',
  async ({ 
    status, 
    skip = 0, 
    limit = 100 
  }: { 
    status?: TradingStatusType; 
    skip?: number; 
    limit?: number; 
  } = {}) => {
    return await tradingProcessService.getAll(status, skip, limit);
  }
);

export const fetchTradingProcessById = createAsyncThunk(
  'tradingProcess/fetchTradingProcessById',
  async (id: string) => {
    return await tradingProcessService.getById(id);
  }
);

export const createTradingProcess = createAsyncThunk(
  'tradingProcess/createTradingProcess',
  async (data: TradingProcessCreate) => {
    return await tradingProcessService.create(data);
  }
);

export const updateTradingProcess = createAsyncThunk(
  'tradingProcess/updateTradingProcess',
  async ({ id, data }: { id: string; data: TradingProcessUpdate }) => {
    return await tradingProcessService.update(id, data);
  }
);

export const deleteTradingProcess = createAsyncThunk(
  'tradingProcess/deleteTradingProcess',
  async (id: string) => {
    await tradingProcessService.remove(id);
    return id;
  }
);

export const startTradingProcess = createAsyncThunk(
  'tradingProcess/startTradingProcess',
  async (id: string) => {
    return await tradingProcessService.start(id);
  }
);

export const stopTradingProcess = createAsyncThunk(
  'tradingProcess/stopTradingProcess',
  async (id: string) => {
    return await tradingProcessService.stop(id);
  }
);

export const fetchRunningTradingProcesses = createAsyncThunk(
  'tradingProcess/fetchRunningTradingProcesses',
  async () => {
    return await tradingProcessService.getRunningProcesses();
  }
);

// State interface
interface TradingProcessState {
  processes: TradingProcess[];
  currentProcess: TradingProcess | null;
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  runningProcesses: TradingProcess[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: TradingProcessState = {
  processes: [],
  currentProcess: null,
  pagination: {
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
  },
  runningProcesses: [],
  isLoading: false,
  error: null,
};

// Slice
const tradingProcessSlice = createSlice({
  name: 'tradingProcess',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProcess: (state) => {
      state.currentProcess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch trading processes
      .addCase(fetchTradingProcesses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTradingProcesses.fulfilled, (state, action: PayloadAction<TradingProcessPaginatedResponse>) => {
        state.isLoading = false;
        state.processes = action.payload.items;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          page_size: action.payload.page_size,
          total_pages: action.payload.total_pages,
        };
      })
      .addCase(fetchTradingProcesses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Không thể tải danh sách trading process';
      })

      // Fetch trading process by ID
      .addCase(fetchTradingProcessById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTradingProcessById.fulfilled, (state, action: PayloadAction<TradingProcess>) => {
        state.isLoading = false;
        state.currentProcess = action.payload;
      })
      .addCase(fetchTradingProcessById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Không thể tải chi tiết trading process';
      })

      // Create trading process
      .addCase(createTradingProcess.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTradingProcess.fulfilled, (state, action: PayloadAction<TradingProcess>) => {
        state.isLoading = false;
        state.processes.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createTradingProcess.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Không thể tạo trading process mới';
      })

      // Update trading process
      .addCase(updateTradingProcess.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTradingProcess.fulfilled, (state, action: PayloadAction<TradingProcess>) => {
        state.isLoading = false;
        const index = state.processes.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.processes[index] = action.payload;
        }
        if (state.currentProcess && state.currentProcess._id === action.payload._id) {
          state.currentProcess = action.payload;
        }
      })
      .addCase(updateTradingProcess.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Không thể cập nhật trading process';
      })

      // Delete trading process
      .addCase(deleteTradingProcess.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTradingProcess.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.processes = state.processes.filter(p => p._id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentProcess && state.currentProcess._id === action.payload) {
          state.currentProcess = null;
        }
      })
      .addCase(deleteTradingProcess.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Không thể xóa trading process';
      })

      // Start trading process
      .addCase(startTradingProcess.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startTradingProcess.fulfilled, (state, action: PayloadAction<TradingProcess>) => {
        state.isLoading = false;
        const index = state.processes.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.processes[index] = action.payload;
        }
        if (state.currentProcess && state.currentProcess._id === action.payload._id) {
          state.currentProcess = action.payload;
        }
      })
      .addCase(startTradingProcess.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Không thể bắt đầu trading process';
      })

      // Stop trading process
      .addCase(stopTradingProcess.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(stopTradingProcess.fulfilled, (state, action: PayloadAction<TradingProcess>) => {
        state.isLoading = false;
        const index = state.processes.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.processes[index] = action.payload;
        }
        if (state.currentProcess && state.currentProcess._id === action.payload._id) {
          state.currentProcess = action.payload;
        }
      })
      .addCase(stopTradingProcess.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Không thể dừng trading process';
      })

      // Fetch running trading processes
      .addCase(fetchRunningTradingProcesses.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchRunningTradingProcesses.fulfilled, (state, action: PayloadAction<TradingProcess[]>) => {
        state.runningProcesses = action.payload;
      })
      .addCase(fetchRunningTradingProcesses.rejected, (state, action) => {
        state.error = action.error.message || 'Không thể tải danh sách trading process đang chạy';
      });
  },
});

export const { clearError, clearCurrentProcess } = tradingProcessSlice.actions;
export default tradingProcessSlice.reducer;
