import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
} from "axios";
import { AxiosHeaders } from "axios";
import cognitoService from "@services/cognito.service";
import { store } from "@features/store";
import { forceLogout, updateTokens } from "@features/auth/authSlice";

const API_URL = import.meta.env.VITE_API_URL;

interface RetriableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  headers?: AxiosRequestHeaders;
}

const LOGIN_PATH = "/login";

const redirectToLogin = () => {
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (window.location.pathname !== LOGIN_PATH) {
    localStorage.setItem("postLoginRedirect", currentPath);
  }

  store.dispatch(forceLogout());
  window.dispatchEvent(new CustomEvent("auth:logout"));

  if (window.location.pathname !== LOGIN_PATH) {
    window.location.assign(LOGIN_PATH);
  }
};

// Create API client
const createApiClient = (): AxiosInstance => {
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - adds Cognito authorization token to requests
  api.interceptors.request.use(
    async (config) => {
      try {
        // Get access token from Cognito
        const accessToken = await cognitoService.getAccessToken();

        if (accessToken) {
          const headers = config.headers;
          if (headers instanceof AxiosHeaders) {
            headers.set("Authorization", `Bearer ${accessToken}`);
          } else {
            const plainHeaders = (headers ?? {}) as Record<string, unknown>;
            config.headers = {
              ...plainHeaders,
              Authorization: `Bearer ${accessToken}`,
            } as AxiosRequestHeaders;
          }
        }
      } catch (error) {
        console.error("Error getting Cognito token:", error);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handles token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const originalRequest = error.config as RetriableRequestConfig;

      if (status === 401) {
        if (originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            console.log(
              "Token expired. Attempting to refresh Cognito session..."
            );

            // Try to refresh the Cognito session
            const tokens = await cognitoService.refreshSession();

            if (tokens) {
              console.log("Cognito session refreshed successfully");

              // Update tokens in Redux store
              store.dispatch(
                updateTokens({
                  accessToken: tokens.accessToken,
                  idToken: tokens.idToken,
                  expiresAt: tokens.expiresAt,
                })
              );

              // Retry the original request with new token
              const existingHeaders = originalRequest.headers;

              if (existingHeaders instanceof AxiosHeaders) {
                existingHeaders.set(
                  "Authorization",
                  `Bearer ${tokens.accessToken}`
                );
              } else {
                const plainHeaders = (existingHeaders ?? {}) as Record<
                  string,
                  unknown
                >;
                originalRequest.headers = {
                  ...plainHeaders,
                  Authorization: `Bearer ${tokens.accessToken}`,
                } as AxiosRequestHeaders;
              }

              return api(originalRequest);
            } else {
              // Refresh failed, redirect to login
              console.error("Failed to refresh Cognito session");
              redirectToLogin();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            console.error("Failed to refresh Cognito session:", refreshError);
            redirectToLogin();
            return Promise.reject(refreshError);
          }
        }

        // Already tried to refresh or no retry flag
        redirectToLogin();
      }

      return Promise.reject(error);
    }
  );

  return api;
};

// Create public API client (no auth)
export const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create API client with auth
export const api = createApiClient();

export default api;
