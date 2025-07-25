import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import * as tradingAccountService from '@services/tradingAccount.service';
import type { 
  TradingAccount, 
  TradingAccountCreate, 
  TradingAccountUpdate,
  TradingAccountPaginatedResponse 
} from '@/types/trading.types';

// Async thunks

export const fetchTradingAccounts = createAsyncThunk(
  'tradingAccount/fetchTradingAccounts',
  async ({ 
    page = 1, 
    page_size = 20,
    is_active,
    exchange 
  }: { 
    page?: number; 
    page_size?: number; 
    is_active?: boolean;
    exchange?: string;
  } = {}) => {
    return await tradingAccountService.getAll(page, page_size, is_active, exchange as any);
  }
);

export const fetchTradingAccountById = createAsyncThunk(
  'tradingAccount/fetchTradingAccountById',
  async (id: string) => {
    return await tradingAccountService.getById(id);
  }
);

export const createTradingAccount = createAsyncThunk(
  'tradingAccount/createTradingAccount',
  async (data: TradingAccountCreate) => {
    return await tradingAccountService.create(data);
  }
);

export const updateTradingAccount = createAsyncThunk(
  'tradingAccount/updateTradingAccount',
  async ({ id, data }: { id: string; data: TradingAccountUpdate }) => {
    return await tradingAccountService.update(id, data);
  }
);

export const deleteTradingAccount = createAsyncThunk(
  'tradingAccount/deleteTradingAccount',
  async (id: string) => {
    await tradingAccountService.remove(id);
    return id;
  }
);

export const fetchActiveTradingAccounts = createAsyncThunk(
  'tradingAccount/fetchActiveTradingAccounts',
  async () => {
    return await tradingAccountService.getActiveAccounts();
  }
);

// State interface
interface TradingAccountState {
  accounts: TradingAccount[];
  activeAccounts: TradingAccount[];
  currentAccount: TradingAccount | null;
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: TradingAccountState = {
  accounts: [],
  activeAccounts: [],
  currentAccount: null,
  pagination: {
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 0,
  },
  isLoading: false,
  error: null,
};

// Slice
const tradingAccountSlice = createSlice({
  name: 'tradingAccount',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAccount: (state) => {
      state.currentAccount = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch trading accounts
      .addCase(fetchTradingAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTradingAccounts.fulfilled, (state, action: PayloadAction<TradingAccountPaginatedResponse>) => {
        state.isLoading = false;
        state.accounts = action.payload.items;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          page_size: action.payload.page_size,
          total_pages: action.payload.total_pages,
        };
      })
      .addCase(fetchTradingAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Không thể tải danh sách tài khoản trading';
      })

      // Fetch trading account by ID
      .addCase(fetchTradingAccountById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTradingAccountById.fulfilled, (state, action: PayloadAction<TradingAccount>) => {
        state.isLoading = false;
        state.currentAccount = action.payload;
      })
      .addCase(fetchTradingAccountById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Không thể tải chi tiết tài khoản trading';
      })

      // Create trading account
      .addCase(createTradingAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTradingAccount.fulfilled, (state, action: PayloadAction<TradingAccount>) => {
        state.isLoading = false;
        state.accounts.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createTradingAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Không thể tạo tài khoản trading mới';
      })

      // Update trading account
      .addCase(updateTradingAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTradingAccount.fulfilled, (state, action: PayloadAction<TradingAccount>) => {
        state.isLoading = false;
        const index = state.accounts.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
        if (state.currentAccount && state.currentAccount._id === action.payload._id) {
          state.currentAccount = action.payload;
        }
      })
      .addCase(updateTradingAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Không thể cập nhật tài khoản trading';
      })

      // Delete trading account
      .addCase(deleteTradingAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTradingAccount.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.accounts = state.accounts.filter(a => a._id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentAccount && state.currentAccount._id === action.payload) {
          state.currentAccount = null;
        }
      })
      .addCase(deleteTradingAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Không thể xóa tài khoản trading';
      })

      // Fetch active trading accounts
      .addCase(fetchActiveTradingAccounts.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchActiveTradingAccounts.fulfilled, (state, action: PayloadAction<TradingAccount[]>) => {
        state.activeAccounts = action.payload;
      })
      .addCase(fetchActiveTradingAccounts.rejected, (state, action) => {
        state.error = action.error.message || 'Không thể tải danh sách tài khoản trading hoạt động';
      });
  },
});

export const { clearError, clearCurrentAccount } = tradingAccountSlice.actions;
export default tradingAccountSlice.reducer;
