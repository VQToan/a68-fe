import { useEffect, useCallback, useRef } from "react";
import { useAppSelector, useAppDispatch } from "./reduxHooks";
import {
  login,
  logout,
  register,
  confirmSignUp,
  resendVerificationCode,
  forgotPassword,
  confirmPasswordReset,
  checkAuthSession,
  clearError,
} from "@features/auth/authSlice";
import cognitoService from "@services/cognito.service";
import type {
  LoginCredentials,
  RegisterCredentials,
  ConfirmSignUpCredentials,
  ResetPasswordCredentials,
} from "../types/auth.types";

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle login
  const handleLogin = useCallback(
    (credentials: LoginCredentials) => {
      return dispatch(login(credentials));
    },
    [dispatch]
  );

  // Handle register
  const handleRegister = useCallback(
    (credentials: RegisterCredentials) => {
      return dispatch(register(credentials));
    },
    [dispatch]
  );

  // Handle confirm sign up (email verification)
  const handleConfirmSignUp = useCallback(
    (credentials: ConfirmSignUpCredentials) => {
      return dispatch(confirmSignUp(credentials));
    },
    [dispatch]
  );

  // Handle resend verification code
  const handleResendVerificationCode = useCallback(
    (email: string) => {
      return dispatch(resendVerificationCode(email));
    },
    [dispatch]
  );

  // Handle logout
  const handleLogout = useCallback(() => {
    return dispatch(logout());
  }, [dispatch]);

  // Handle forgot password
  const handleForgotPassword = useCallback(
    (email: string) => {
      return dispatch(forgotPassword(email));
    },
    [dispatch]
  );

  // Handle confirm password reset
  const handleConfirmPasswordReset = useCallback(
    (credentials: ResetPasswordCredentials) => {
      return dispatch(confirmPasswordReset(credentials));
    },
    [dispatch]
  );

  // Handle clear error
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const sessionInitializedRef = useRef(false);

  // Check authentication session only once on first mount
  useEffect(() => {
    if (!sessionInitializedRef.current) {
      sessionInitializedRef.current = true;
      dispatch(checkAuthSession());
    }
  }, [dispatch]);

  // Token expiration check and auto-logout
  useEffect(() => {
    const checkSession = async () => {
      if (!auth.isLoggedIn) return;

      try {
        // Check if session is still valid
        const isAuth = await cognitoService.isAuthenticated();

        if (!isAuth) {
          console.log("Session expired, logging out...");
          dispatch(logout());
          return;
        }

        // Check token expiration
        const tokens = await cognitoService.getAuthTokens();
        if (tokens?.expiresAt) {
          const now = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = tokens.expiresAt - now;

          // If token expires in less than 5 minutes, try to refresh
          if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
            console.log("Token expiring soon, refreshing...");
            await cognitoService.refreshSession();
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
        dispatch(logout());
      }
    };

    // Check session immediately
    if (auth.isLoggedIn) {
      checkSession();
    }

    // Set up interval to check session every minute
    sessionCheckIntervalRef.current = setInterval(checkSession, 60000);

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [auth.isLoggedIn, dispatch]);

  // Check if user has admin or superadmin role
  const isAdmin = Boolean(
    auth.cognitoUser?.role &&
      ["admin", "superadmin", "Admin", "SuperAdmin", "super_admin"].includes(
        auth.cognitoUser.role
      )
  );

  return {
    // State
    ...auth,

    // Computed properties
    isAdmin,

    // Actions
    login: handleLogin,
    register: handleRegister,
    confirmSignUp: handleConfirmSignUp,
    resendVerificationCode: handleResendVerificationCode,
    logout: handleLogout,
    forgotPassword: handleForgotPassword,
    confirmPasswordReset: handleConfirmPasswordReset,
    clearError: handleClearError,
  };
};
