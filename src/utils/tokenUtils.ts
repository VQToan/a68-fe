import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  iat: number;
  sub?: string;
  [key: string]: unknown;
}

/**
 * Check if a token is expired
 * @param token - JWT token
 * @returns boolean - true if token is expired, false otherwise
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;

    // Check if token has expired
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

/**
 * Get time remaining before token expiration in seconds
 * @param token - JWT token
 * @returns number - seconds until expiration, or 0 if expired/invalid
 */
export const getTokenExpiryTime = (token: string | null): number => {
  if (!token) return 0;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      return 0;
    }

    return Math.floor(decoded.exp - currentTime);
  } catch (error) {
    console.error("Error decoding token:", error);
    return 0;
  }
};

/**
 * Get user ID from token
 * @param token - JWT token
 * @returns string | null - user ID from token, or null if invalid
 */
export const getUserIdFromToken = (token: string | null): string | null => {
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.sub || null; // Assuming 'sub' is the user ID in your token
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Store tokens in localStorage
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 * @param accessTokenExpiresAt - Timestamp when access token expires
 * @param refreshTokenExpiresAt - Timestamp when refresh token expires
 */
export const storeTokens = (
  accessToken: string,
  refreshToken: string,
  accessTokenExpiresAt: number,
  refreshTokenExpiresAt: number
): void => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("accessTokenExpiresAt", accessTokenExpiresAt.toString());
  localStorage.setItem("refreshTokenExpiresAt", refreshTokenExpiresAt.toString());
};

/**
 * Remove tokens from localStorage
 */
export const removeTokens = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("accessTokenExpiresAt");
  localStorage.removeItem("refreshTokenExpiresAt");
  localStorage.removeItem("user");
};

/**
 * Get stored access token
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem("refreshToken");
};

/**
 * Get access token expiration timestamp
 */
export const getAccessTokenExpiresAt = (): number | null => {
  const expires = localStorage.getItem("accessTokenExpiresAt");
  return expires ? parseInt(expires, 10) : null;
};

/**
 * Get refresh token expiration timestamp
 */
export const getRefreshTokenExpiresAt = (): number | null => {
  const expires = localStorage.getItem("refreshTokenExpiresAt");
  return expires ? parseInt(expires, 10) : null;
};
