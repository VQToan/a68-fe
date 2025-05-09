import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, LoginCredentials, RegisterCredentials, Token, User, UserUpdate } from '@types/auth.types';
import authService from '@services/auth.service';

// Get initial auth state from localStorage
const tokenData = authService.getTokenData();
const user = authService.getUserFromStorage();

const initialState: AuthState = {
  user: user,
  accessToken: tokenData.accessToken,
  refreshToken: tokenData.refreshToken,
  accessTokenExpiresAt: tokenData.accessTokenExpiresAt,
  refreshTokenExpiresAt: tokenData.refreshTokenExpiresAt,
  isLoggedIn: !!tokenData.accessToken,
  isLoading: false,
  error: null,
};

// Register a new user
export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const user = await authService.register(credentials);
      return user;
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Registration failed');
    }
  }
);

// Login a user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { dispatch, rejectWithValue }) => {
    try {
      const tokenData = await authService.login(credentials);
      // After successful login, fetch user data
      dispatch(fetchCurrentUser());
      return tokenData;
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Login failed');
    }
  }
);

// Logout a user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Logout failed');
    }
  }
);

// Fetch current user data
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch user data');
    }
  }
);

// Update current user data
export const updateCurrentUser = createAsyncThunk(
  'auth/updateCurrentUser',
  async (userData: UserUpdate, { rejectWithValue }) => {
    try {
      const updatedUser = await authService.updateCurrentUser(userData);
      return updatedUser;
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Failed to update user data');
    }
  }
);

// Refresh the token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;
      
      if (!refreshToken) {
        return rejectWithValue('No refresh token available');
      }
      
      const tokenData = await authService.refreshToken(refreshToken);
      return tokenData;
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Token refresh failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        // Registration successful, but user still needs to login
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<Token>) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.accessTokenExpiresAt = action.payload.access_token_expires_at;
        state.refreshTokenExpiresAt = action.payload.refresh_token_expires_at;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Logout cases
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.accessTokenExpiresAt = null;
        state.refreshTokenExpiresAt = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.accessTokenExpiresAt = null;
        state.refreshTokenExpiresAt = null;
      })
      
      // Fetch current user cases
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update current user cases
      .addCase(updateCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Refresh token cases
      .addCase(refreshToken.fulfilled, (state, action: PayloadAction<Token>) => {
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.accessTokenExpiresAt = action.payload.access_token_expires_at;
        state.refreshTokenExpiresAt = action.payload.refresh_token_expires_at;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isLoggedIn = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.accessTokenExpiresAt = null;
        state.refreshTokenExpiresAt = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;