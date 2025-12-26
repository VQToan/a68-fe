export interface User {
  _id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

// Cognito User (from Cognito attributes)
export interface CognitoUserInfo {
  userId: string;
  username: string;
  email?: string;
  fullName?: string;
  emailVerified?: boolean;
}

export type AuthStep =
  | "IDLE"
  | "CONFIRM_SIGN_UP"
  | "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
  | "RESET_PASSWORD"
  | "DONE";

export interface AuthState {
  user: User | null;
  cognitoUser: CognitoUserInfo | null;
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: number | null;
  refreshTokenExpiresAt: number | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  // Cognito specific states
  requiresVerification: boolean;
  pendingUsername: string | null;
  authStep: AuthStep;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name?: string;
}

export interface UserUpdate {
  email?: string | null;
  full_name?: string | null;
  password?: string | null;
  is_active?: boolean | null;
  is_superuser?: boolean | null;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
  access_token_expires_at: number;
  refresh_token_expires_at: number;
}

export interface ConfirmSignUpCredentials {
  email: string;
  code: string;
}

export interface ResetPasswordCredentials {
  email: string;
  code: string;
  newPassword: string;
}
