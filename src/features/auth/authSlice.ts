import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  ConfirmSignUpCredentials,
  ResetPasswordCredentials,
} from "../../types/auth.types";
import cognitoService from "@services/cognito.service";

const initialState: AuthState = {
  user: null,
  cognitoUser: null,
  accessToken: null,
  idToken: null,
  refreshToken: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
  isLoggedIn: false,
  isLoading: false,
  isInitializing: true, // Start with true, set false after first session check
  error: null,
  requiresVerification: false,
  pendingUsername: null,
  authStep: "IDLE",
};

// Register a new user with Cognito
export const register = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const result = await cognitoService.signUp({
        email: credentials.email,
        password: credentials.password,
        fullName: credentials.full_name,
      });

      return {
        email: credentials.email,
        isComplete: result.isSignUpComplete,
        nextStep: result.nextStep,
      };
    } catch (error: unknown) {
      const err = error as Error & { name?: string; message?: string };
      if (err.name === "UsernameExistsException") {
        return rejectWithValue("User already exists");
      }
      return rejectWithValue(err.message || "Registration failed");
    }
  }
);

// Confirm sign up with verification code
export const confirmSignUp = createAsyncThunk(
  "auth/confirmSignUp",
  async (credentials: ConfirmSignUpCredentials, { rejectWithValue }) => {
    try {
      const isComplete = await cognitoService.confirmSignUp(credentials);
      return { email: credentials.email, isComplete };
    } catch (error: unknown) {
      const err = error as Error & { name?: string; message?: string };
      if (err.name === "CodeMismatchException") {
        return rejectWithValue("Invalid verification code");
      }
      if (err.name === "ExpiredCodeException") {
        return rejectWithValue("Verification code expired");
      }
      return rejectWithValue(err.message || "Verification failed");
    }
  }
);

// Resend verification code
export const resendVerificationCode = createAsyncThunk(
  "auth/resendVerificationCode",
  async (email: string, { rejectWithValue }) => {
    try {
      await cognitoService.resendSignUpCode(email);
      return email;
    } catch (error: unknown) {
      const err = error as Error & { message?: string };
      return rejectWithValue(err.message || "Failed to resend code");
    }
  }
);

// Login a user with Cognito
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const result = await cognitoService.signIn({
        email: credentials.email,
        password: credentials.password,
      });

      if (!result.isSignedIn) {
        // Handle different auth challenges
        if (result.nextStep === "CONFIRM_SIGN_UP") {
          return {
            email: credentials.email,
            requiresVerification: true,
            nextStep: result.nextStep,
          };
        }
        return rejectWithValue("Sign in incomplete: " + result.nextStep);
      }

      // Get tokens after successful sign in
      const tokens = await cognitoService.getAuthTokens();
      const cognitoUser = await cognitoService.getCurrentUser();

      return {
        accessToken: tokens?.accessToken || null,
        idToken: tokens?.idToken || null,
        expiresAt: tokens?.expiresAt || null,
        cognitoUser,
        requiresVerification: false,
        nextStep: "DONE" as const,
      };
    } catch (error: unknown) {
      const err = error as Error & { name?: string; message?: string };

      // Handle user not confirmed
      if (err.name === "UserNotConfirmedException") {
        return {
          email: credentials.email,
          requiresVerification: true,
          nextStep: "CONFIRM_SIGN_UP" as const,
        };
      }

      if (err.name === "NotAuthorizedException") {
        return rejectWithValue("Incorrect email or password");
      }

      if (err.name === "UserNotFoundException") {
        return rejectWithValue("User not found");
      }

      return rejectWithValue(err.message || "Login failed");
    }
  }
);

// Logout a user
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await cognitoService.signOut();
    } catch (error: unknown) {
      const err = error as Error & { message?: string };
      return rejectWithValue(err.message || "Logout failed");
    }
  }
);

// Request password reset
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      await cognitoService.forgotPassword(email);
      return email;
    } catch (error: unknown) {
      const err = error as Error & { name?: string; message?: string };
      if (err.name === "UserNotFoundException") {
        return rejectWithValue("User not found");
      }
      return rejectWithValue(err.message || "Failed to send reset code");
    }
  }
);

// Confirm password reset
export const confirmPasswordReset = createAsyncThunk(
  "auth/confirmPasswordReset",
  async (credentials: ResetPasswordCredentials, { rejectWithValue }) => {
    try {
      await cognitoService.confirmResetPassword(credentials);
      return true;
    } catch (error: unknown) {
      const err = error as Error & { name?: string; message?: string };
      if (err.name === "CodeMismatchException") {
        return rejectWithValue("Invalid verification code");
      }
      if (err.name === "ExpiredCodeException") {
        return rejectWithValue("Verification code expired");
      }
      return rejectWithValue(err.message || "Failed to reset password");
    }
  }
);

// Refresh Cognito session
export const refreshSession = createAsyncThunk(
  "auth/refreshSession",
  async (_, { rejectWithValue }) => {
    try {
      const tokens = await cognitoService.refreshSession();
      if (!tokens) {
        return rejectWithValue("Session expired");
      }
      return tokens;
    } catch (error: unknown) {
      const err = error as Error & { message?: string };
      return rejectWithValue(err.message || "Failed to refresh session");
    }
  }
);

// Check and restore session on app load
export const checkAuthSession = createAsyncThunk(
  "auth/checkAuthSession",
  async (_, { rejectWithValue }) => {
    try {
      const isAuth = await cognitoService.isAuthenticated();
      if (!isAuth) {
        return { isLoggedIn: false };
      }

      const tokens = await cognitoService.getAuthTokens();
      const cognitoUser = await cognitoService.getCurrentUser();

      return {
        isLoggedIn: true,
        accessToken: tokens?.accessToken || null,
        idToken: tokens?.idToken || null,
        expiresAt: tokens?.expiresAt || null,
        cognitoUser,
      };
    } catch (error: unknown) {
      const err = error as Error & { message?: string };
      return rejectWithValue(err.message || "Failed to check session");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRequiresVerification: (
      state,
      action: PayloadAction<{ email: string; requires: boolean }>
    ) => {
      state.requiresVerification = action.payload.requires;
      state.pendingUsername = action.payload.email;
      state.authStep = action.payload.requires ? "CONFIRM_SIGN_UP" : "IDLE";
    },
    forceLogout: (state) => {
      state.isLoading = false;
      state.isLoggedIn = false;
      state.user = null;
      state.cognitoUser = null;
      state.accessToken = null;
      state.idToken = null;
      state.refreshToken = null;
      state.accessTokenExpiresAt = null;
      state.refreshTokenExpiresAt = null;
      state.error = null;
      state.requiresVerification = false;
      state.pendingUsername = null;
      state.authStep = "IDLE";
      localStorage.removeItem("user");
    },
    updateTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        idToken: string;
        expiresAt?: number;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.idToken = action.payload.idToken;
      state.accessTokenExpiresAt = action.payload.expiresAt || null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingUsername = action.payload.email;
        if (!action.payload.isComplete) {
          state.requiresVerification = true;
          state.authStep = "CONFIRM_SIGN_UP";
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Confirm Sign Up cases
      .addCase(confirmSignUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmSignUp.fulfilled, (state) => {
        state.isLoading = false;
        state.requiresVerification = false;
        state.authStep = "DONE";
      })
      .addCase(confirmSignUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Resend verification code cases
      .addCase(resendVerificationCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendVerificationCode.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendVerificationCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;

        if (
          "requiresVerification" in action.payload &&
          action.payload.requiresVerification
        ) {
          state.requiresVerification = true;
          state.pendingUsername = action.payload.email || null;
          state.authStep = "CONFIRM_SIGN_UP";
          state.isLoggedIn = false;
        } else if ("accessToken" in action.payload) {
          state.isLoggedIn = true;
          state.accessToken = action.payload.accessToken ?? null;
          state.idToken = action.payload.idToken ?? null;
          state.accessTokenExpiresAt = action.payload.expiresAt ?? null;
          state.cognitoUser = action.payload.cognitoUser ?? null;
          state.requiresVerification = false;
          state.pendingUsername = null;
          state.authStep = "DONE";
        }
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
        state.cognitoUser = null;
        state.accessToken = null;
        state.idToken = null;
        state.refreshToken = null;
        state.accessTokenExpiresAt = null;
        state.refreshTokenExpiresAt = null;
        state.requiresVerification = false;
        state.pendingUsername = null;
        state.authStep = "IDLE";
        localStorage.removeItem("user");
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.isLoggedIn = false;
        state.user = null;
        state.cognitoUser = null;
        state.accessToken = null;
        state.idToken = null;
        state.refreshToken = null;
        state.accessTokenExpiresAt = null;
        state.refreshTokenExpiresAt = null;
        localStorage.removeItem("user");
      })

      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingUsername = action.payload;
        state.authStep = "RESET_PASSWORD";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Confirm password reset cases
      .addCase(confirmPasswordReset.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmPasswordReset.fulfilled, (state) => {
        state.isLoading = false;
        state.pendingUsername = null;
        state.authStep = "DONE";
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Refresh session cases
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.idToken = action.payload.idToken;
        state.accessTokenExpiresAt = action.payload.expiresAt || null;
      })
      .addCase(refreshSession.rejected, (state) => {
        // Force logout on refresh failure
        state.isLoggedIn = false;
        state.user = null;
        state.cognitoUser = null;
        state.accessToken = null;
        state.idToken = null;
        state.refreshToken = null;
        state.accessTokenExpiresAt = null;
        state.refreshTokenExpiresAt = null;
        localStorage.removeItem("user");
      })

      // Check auth session cases
      .addCase(checkAuthSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitializing = false;
        if (action.payload.isLoggedIn && "accessToken" in action.payload) {
          state.isLoggedIn = true;
          state.accessToken = action.payload.accessToken ?? null;
          state.idToken = action.payload.idToken ?? null;
          state.accessTokenExpiresAt = action.payload.expiresAt ?? null;
          state.cognitoUser = action.payload.cognitoUser ?? null;
        } else {
          state.isLoggedIn = false;
        }
      })
      .addCase(checkAuthSession.rejected, (state) => {
        state.isLoading = false;
        state.isInitializing = false;
        state.isLoggedIn = false;
      });
  },
});

export const {
  clearError,
  setRequiresVerification,
  forceLogout,
  updateTokens,
} = authSlice.actions;
export default authSlice.reducer;
