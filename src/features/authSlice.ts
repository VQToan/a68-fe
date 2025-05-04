import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setToken, removeToken, isTokenValid } from '../utils/tokenUtils';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

// Check if token exists and is valid on initial load
const initialState: AuthState = {
  token: null,
  isAuthenticated: isTokenValid(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest(state, action: PayloadAction<{ username: string; password: string }>) {
      // This is just a trigger for the saga, no state change here
    },
    loginSuccess(state, action: PayloadAction<string>) {
      state.token = action.payload;
      state.isAuthenticated = true;
      setToken(action.payload);
    },
    loginFailure(state) {
      state.token = null;
      state.isAuthenticated = false;
    },
    logout(state) {
      state.token = null;
      state.isAuthenticated = false;
      removeToken();
    },
  },
});

export const { loginRequest, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;