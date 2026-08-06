import axios from 'axios';
import { useUserStore } from '@/stores/userStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const MARKET_API_URL = import.meta.env.VITE_MARKET_API_BASE_URL || 'http://localhost:8001';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for sending/receiving the HttpOnly refresh token cookie
  timeout: 15000,
});

export const marketApiClient = axios.create({
  baseURL: MARKET_API_URL,
  withCredentials: true,
  timeout: 15000,
});

// Request Interceptor for marketApiClient: Attach access token
marketApiClient.interceptors.request.use((config) => {
  const token = useUserStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Request Interceptor: Attach the access token if available
apiClient.interceptors.request.use((config) => {
  const token = useUserStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

// Reusable response interceptor to handle 401s and automatic token refresh
const handleResponseError = (client: any) => async (error: any) => {
  const originalRequest = error.config;

  if (error.response?.status === 401 && !originalRequest._retry) {
    if (originalRequest.url?.includes('/auth/refresh')) {
      useUserStore.getState().logout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = axios
        .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true, timeout: 15000 })
        .then((res) => {
          refreshPromise = null;
          return res.data.access_token;
        })
        .catch((err) => {
          refreshPromise = null;
          throw err;
        });
    }

    try {
      const newAccessToken = await refreshPromise;
      useUserStore.getState().setAccessToken(newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return client(originalRequest);
    } catch (refreshError) {
      useUserStore.getState().logout();
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
};

apiClient.interceptors.response.use((response) => response, handleResponseError(apiClient));

marketApiClient.interceptors.response.use(
  (response) => response,
  handleResponseError(marketApiClient),
);
