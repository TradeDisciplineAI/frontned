import axios from 'axios';
import { useUserStore } from '@/stores/userStore';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for sending/receiving the HttpOnly refresh token cookie
});

// Request Interceptor: Attach the access token if available
apiClient.interceptors.request.use((config) => {
  const token = useUserStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401s and automatic token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If it's a 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loops on the refresh endpoint itself
      if (originalRequest.url === '/auth/refresh') {
        // Refresh failed (cookie expired/invalid) -> force logout
        useUserStore.getState().logout();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Attempt to get a new access token using the HttpOnly cookie
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const newAccessToken = data.access_token;
        
        // Update the store with the new token
        useUserStore.getState().setAccessToken(newAccessToken);
        
        // Update the original request's header and retry
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g., cookie expired) -> logout
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
