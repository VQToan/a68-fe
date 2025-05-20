import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  getBacktestResultsByProcessId,
  getBacktestResultDetail,
  deleteBacktestResult,
} from "@/services/backtestResult.service";
import type {
  BacktestResultDetail,
  BacktestResultSummary,
} from "@/types/backtestResult.type";

interface BacktestResultState {
  resultsByProcess: Record<string, BacktestResultSummary[]>;
  resultDetails: Record<string, BacktestResultDetail>;
  loading: boolean;
  loadingDetail: boolean;
  error: string | null;
}

const initialState: BacktestResultState = {
  resultsByProcess: {},
  resultDetails: {},
  loading: false,
  loadingDetail: false,
  error: null,
};

// Async thunks
export const fetchBacktestResultsByProcessId = createAsyncThunk(
  "backtestResult/fetchByProcessId",
  async (processId: string, { rejectWithValue }) => {
    try {
      return await getBacktestResultsByProcessId(processId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch backtest results"
      );
    }
  }
);

export const fetchBacktestResultDetail = createAsyncThunk(
  "backtestResult/fetchDetail",
  async (resultId: string, { rejectWithValue }) => {
    try {
      return await getBacktestResultDetail(resultId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch backtest result detail"
      );
    }
  }
);

export const removeBacktestResult = createAsyncThunk(
  "backtestResult/remove",
  async (resultId: string, { rejectWithValue }) => {
    try {
      await deleteBacktestResult(resultId);
      return resultId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete backtest result"
      );
    }
  }
);

const backtestResultSlice = createSlice({
  name: "backtestResult",
  initialState,
  reducers: {
    clearBacktestResults: (state) => {
      state.resultsByProcess = {};
      state.resultDetails = {};
      state.error = null;
    },
    clearBacktestResultDetail: (state, action: PayloadAction<string>) => {
      const resultId = action.payload;
      delete state.resultDetails[resultId];
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchBacktestResultsByProcessId
      .addCase(fetchBacktestResultsByProcessId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBacktestResultsByProcessId.fulfilled, (state, action) => {
        const processId = action.meta.arg;
        state.resultsByProcess[processId] = action.payload;
        state.loading = false;
      })
      .addCase(fetchBacktestResultsByProcessId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Handle fetchBacktestResultDetail
      .addCase(fetchBacktestResultDetail.pending, (state) => {
        state.loadingDetail = true;
        state.error = null;
      })
      .addCase(fetchBacktestResultDetail.fulfilled, (state, action) => {
        state.resultDetails[action.payload._id] = action.payload;
        state.loadingDetail = false;
      })
      .addCase(fetchBacktestResultDetail.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = action.payload as string;
      })

      // Handle removeBacktestResult
      .addCase(removeBacktestResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeBacktestResult.fulfilled, (state, action) => {
        const resultId = action.payload;

        // Remove from resultDetails
        delete state.resultDetails[resultId];

        // Remove from resultsByProcess
        Object.keys(state.resultsByProcess).forEach((processId) => {
          state.resultsByProcess[processId] = state.resultsByProcess[
            processId
          ].filter((result) => result._id !== resultId);
        });

        state.loading = false;
      })
      .addCase(removeBacktestResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBacktestResults, clearBacktestResultDetail } =
  backtestResultSlice.actions;
export default backtestResultSlice.reducer;
