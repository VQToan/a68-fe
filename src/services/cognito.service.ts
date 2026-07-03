import {
  signUp as amplifySignUp,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  confirmSignUp as amplifyConfirmSignUp,
  confirmSignIn as amplifyConfirmSignIn,
  resendSignUpCode as amplifyResendSignUpCode,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  fetchAuthSession,
  getCurrentUser as amplifyGetCurrentUser,
  fetchUserAttributes,
} from "aws-amplify/auth";

// Types for Cognito auth
export interface CognitoSignUpInput {
  email: string;
  password: string;
  fullName?: string;
}

export interface CognitoSignInInput {
  email: string;
  password: string;
}

export interface CognitoConfirmSignUpInput {
  email: string;
  code: string;
}

export interface CognitoResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

export interface CognitoConfirmNewPasswordInput {
  newPassword: string;
}

export interface CognitoUser {
  userId: string;
  username: string;
  email?: string;
  fullName?: string;
  emailVerified?: boolean;
  role?: string; // Custom attribute for user role
}

export interface CognitoTokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export type AuthNextStep =
  | "CONFIRM_SIGN_UP"
  | "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
  | "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE"
  | "CONFIRM_SIGN_IN_WITH_TOTP_CODE"
  | "CONFIRM_SIGN_IN_WITH_SMS_CODE"
  | "CONTINUE_SIGN_IN_WITH_MFA_SELECTION"
  | "CONTINUE_SIGN_IN_WITH_TOTP_SETUP"
  | "RESET_PASSWORD"
  | "DONE";

export interface SignUpResult {
  isSignUpComplete: boolean;
  userId?: string;
  nextStep: AuthNextStep;
}

export interface SignInResult {
  isSignedIn: boolean;
  nextStep: AuthNextStep;
}

// Sign up a new user
export const signUp = async (
  input: CognitoSignUpInput
): Promise<SignUpResult> => {
  const { email, password, fullName } = input;

  const result = await amplifySignUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        ...(fullName && { name: fullName }),
      },
    },
  });

  return {
    isSignUpComplete: result.isSignUpComplete,
    userId: result.userId,
    nextStep: result.nextStep.signUpStep as AuthNextStep,
  };
};

// Confirm sign up with verification code
export const confirmSignUp = async (
  input: CognitoConfirmSignUpInput
): Promise<boolean> => {
  const { email, code } = input;

  const result = await amplifyConfirmSignUp({
    username: email,
    confirmationCode: code,
  });

  return result.isSignUpComplete;
};

// Resend sign up confirmation code
export const resendSignUpCode = async (email: string): Promise<void> => {
  await amplifyResendSignUpCode({
    username: email,
  });
};

// Sign in user
export const signIn = async (
  input: CognitoSignInInput
): Promise<SignInResult> => {
  const { email, password } = input;

  const result = await amplifySignIn({
    username: email,
    password,
  });

  return {
    isSignedIn: result.isSignedIn,
    nextStep: result.nextStep.signInStep as AuthNextStep,
  };
};

// Complete NEW_PASSWORD_REQUIRED challenge after first sign in.
export const confirmNewPassword = async (
  input: CognitoConfirmNewPasswordInput
): Promise<SignInResult> => {
  const result = await amplifyConfirmSignIn({
    challengeResponse: input.newPassword,
  });

  return {
    isSignedIn: result.isSignedIn,
    nextStep: result.nextStep.signInStep as AuthNextStep,
  };
};

// Sign out user
export const signOut = async (): Promise<void> => {
  await amplifySignOut();
};

// Request password reset
export const forgotPassword = async (email: string): Promise<void> => {
  await amplifyResetPassword({
    username: email,
  });
};

// Confirm password reset with code
export const confirmResetPassword = async (
  input: CognitoResetPasswordInput
): Promise<void> => {
  const { email, code, newPassword } = input;

  await amplifyConfirmResetPassword({
    username: email,
    confirmationCode: code,
    newPassword,
  });
};

// Get current auth session tokens
export const getAuthTokens = async (): Promise<CognitoTokens | null> => {
  try {
    const session = await fetchAuthSession();

    if (!session.tokens) {
      return null;
    }

    const { accessToken, idToken } = session.tokens;

    return {
      accessToken: accessToken?.toString() || "",
      idToken: idToken?.toString() || "",
      expiresAt: accessToken?.payload?.exp as number | undefined,
    };
  } catch {
    return null;
  }
};

// Get access token for API calls
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString() || null;
  } catch {
    return null;
  }
};

// Get ID token (contains user attributes)
export const getIdToken = async (): Promise<string | null> => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() || null;
  } catch {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const session = await fetchAuthSession();
    return !!session.tokens?.accessToken;
  } catch {
    return false;
  }
};

// Get current authenticated user
export const getCurrentUser = async (): Promise<CognitoUser | null> => {
  try {
    const user = await amplifyGetCurrentUser();
    const attributes = await fetchUserAttributes();

    return {
      userId: user.userId,
      username: user.username,
      email: attributes.email,
      fullName: attributes.name,
      emailVerified: attributes.email_verified === "true",
      role: attributes["custom:role"] as string | undefined,
    };
  } catch {
    return null;
  }
};

// Force refresh the session
export const refreshSession = async (): Promise<CognitoTokens | null> => {
  try {
    const session = await fetchAuthSession({ forceRefresh: true });

    if (!session.tokens) {
      return null;
    }

    const { accessToken, idToken } = session.tokens;

    return {
      accessToken: accessToken?.toString() || "",
      idToken: idToken?.toString() || "",
      expiresAt: accessToken?.payload?.exp as number | undefined,
    };
  } catch {
    return null;
  }
};

const cognitoService = {
  signUp,
  confirmSignUp,
  resendSignUpCode,
  signIn,
  confirmNewPassword,
  signOut,
  forgotPassword,
  confirmResetPassword,
  getAuthTokens,
  getAccessToken,
  getIdToken,
  isAuthenticated,
  getCurrentUser,
  refreshSession,
};

export default cognitoService;
