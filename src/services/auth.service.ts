import { api, publicApi } from "@services/apiClient";
import type {
  LoginCredentials,
  RegisterCredentials,
  Token,
  User,
  UserUpdate
} from "@types/auth.types";
import { 
  storeTokens, 
  removeTokens, 
  getAccessTokenExpiresAt, 
  getRefreshTokenExpiresAt 
} from "@utils/tokenUtils";

// Auth service functions
const register = async (credentials: RegisterCredentials): Promise<User> => {
  const response = await publicApi.post<User>("/api/v1/auth/register", credentials);
  return response.data;
};

const login = async (credentials: LoginCredentials): Promise<Token> => {
  const response = await publicApi.post<Token>("/api/v1/auth/login", credentials);
  
  const { 
    access_token, 
    refresh_token, 
    access_token_expires_at, 
    refresh_token_expires_at 
  } = response.data;

  // Store tokens and their expiration timestamps
  storeTokens(
    access_token,
    refresh_token,
    access_token_expires_at,
    refresh_token_expires_at
  );
  
  return response.data;
};

const logout = async (): Promise<void> => {
  try {
    // Call the logout API endpoint
    await api.post("/api/v1/auth/logout");
  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    // Remove all auth data from localStorage
    removeTokens();
  }
};

const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>("/api/v1/users/me");
  // Store user data in localStorage for offline access
  localStorage.setItem("user", JSON.stringify(response.data));
  return response.data;
};

const updateCurrentUser = async (userData: UserUpdate): Promise<User> => {
  const response = await api.put<User>("/api/v1/users/me", userData);
  // Update stored user data
  localStorage.setItem("user", JSON.stringify(response.data));
  return response.data;
};

const refreshToken = async (refreshToken: string): Promise<Token> => {
  const response = await publicApi.post<Token>("/api/v1/auth/refresh", null, {
    params: { refresh_token: refreshToken }
  });

  const { 
    access_token, 
    refresh_token, 
    access_token_expires_at, 
    refresh_token_expires_at 
  } = response.data;
  
  // Store the new tokens and their expiration timestamps
  storeTokens(
    access_token,
    refresh_token,
    access_token_expires_at,
    refresh_token_expires_at
  );
  
  return response.data;
};

const getUserFromStorage = (): User | null => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

const getTokenData = (): {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: number | null;
  refreshTokenExpiresAt: number | null;
} => {
  return {
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
    accessTokenExpiresAt: getAccessTokenExpiresAt(),
    refreshTokenExpiresAt: getRefreshTokenExpiresAt()
  };
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateCurrentUser,
  refreshToken,
  getUserFromStorage,
  getTokenData,
  api
};

export default authService;
