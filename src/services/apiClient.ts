import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { AxiosHeaders } from 'axios';
import { getAccessToken, getRefreshToken, storeTokens, removeTokens } from '@utils/tokenUtils';
import { store } from '@features/store';
import { updateTokens, forceLogout } from '@features/auth/authSlice';
import type { Token } from '../types/auth.types';

const API_URL = import.meta.env.VITE_API_URL;

interface RetriableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  headers?: AxiosRequestHeaders;
}

const LOGIN_PATH = '/login';

const redirectToLogin = () => {
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (window.location.pathname !== LOGIN_PATH) {
    localStorage.setItem('postLoginRedirect', currentPath);
  }

  removeTokens();
  store.dispatch(forceLogout());
  window.dispatchEvent(new CustomEvent('auth:logout'));

  if (window.location.pathname !== LOGIN_PATH) {
    window.location.assign(LOGIN_PATH);
  }
};

// Create API client
const createApiClient = (): AxiosInstance => {
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - adds authorization token to requests
  api.interceptors.request.use(
    (config) => {
      const accessToken = getAccessToken();
      if (accessToken) {
        const headers = config.headers;
        if (headers instanceof AxiosHeaders) {
          headers.set('Authorization', `Bearer ${accessToken}`);
        } else {
          const plainHeaders = (headers ?? {}) as Record<string, unknown>;
          config.headers = {
            ...plainHeaders,
            Authorization: `Bearer ${accessToken}`,
          } as AxiosRequestHeaders;
        }
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
        const refreshToken = getRefreshToken();

        if (originalRequest && !originalRequest._retry && refreshToken) {
          originalRequest._retry = true;

          try {
            console.log('Token expired. Attempting to refresh...');

            const refreshApi = axios.create({
              baseURL: API_URL,
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const response = await refreshApi.post<Token>('/api/v1/auth/refresh', null, {
              params: { refresh_token: refreshToken },
            });

            console.log('Token refreshed successfully');

            storeTokens(
              response.data.access_token,
              response.data.refresh_token,
              response.data.access_token_expires_at,
              response.data.refresh_token_expires_at
            );
            store.dispatch(updateTokens(response.data));

            const existingHeaders = originalRequest.headers;

            if (existingHeaders instanceof AxiosHeaders) {
              existingHeaders.set('Authorization', `Bearer ${response.data.access_token}`);
            } else {
              const plainHeaders = (existingHeaders ?? {}) as Record<string, unknown>;
              originalRequest.headers = {
                ...plainHeaders,
                Authorization: `Bearer ${response.data.access_token}`,
              } as AxiosRequestHeaders;
            }

            return api(originalRequest);
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            redirectToLogin();
            return Promise.reject(refreshError);
          }
        }

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
    'Content-Type': 'application/json',
  },
});

// Create API client with auth
export const api = createApiClient();

export default api;
