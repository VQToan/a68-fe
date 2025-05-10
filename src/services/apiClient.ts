import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { getAccessToken, getRefreshToken, storeTokens, removeTokens } from '@utils/tokenUtils';
import { store } from '@features/store';
import { refreshToken as refreshTokenAction } from '@features/auth/authSlice';
import type { Token } from '../types/auth.types';

const API_URL = 'http://localhost:8001'; // URL của API backend

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
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handles token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 (Unauthorized) and we haven't tried to refresh token yet
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        getRefreshToken() // Only attempt refresh if we have a refresh token
      ) {
        originalRequest._retry = true;

        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          console.log('Token expired. Attempting to refresh...');
          
          // Create a new instance for token refresh to avoid interceptors loop
          const refreshApi = axios.create({
            baseURL: API_URL,
            headers: {
              'Content-Type': 'application/json',
            },
          });

          // Get refresh token from redux store
          const response = await refreshApi.post<Token>('/api/v1/auth/refresh', null, {
            params: { refresh_token: refreshToken }
          });

          const { 
            access_token, 
            refresh_token, 
            access_token_expires_at, 
            refresh_token_expires_at 
          } = response.data;
          
          console.log('Token refreshed successfully');
          
          // Store the new tokens
          storeTokens(
            access_token, 
            refresh_token, 
            access_token_expires_at, 
            refresh_token_expires_at
          );
          
          // Update redux store with the new tokens
          store.dispatch(refreshTokenAction());
          
          // Update authorization header and retry the original request
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          
          // If refresh token failed, clear storage and redirect to login
          removeTokens();
          
          // Dispatch logout event to update app state
          window.dispatchEvent(new CustomEvent('auth:logout'));
          
          // Redirect to login page
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
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
