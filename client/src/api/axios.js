import axios from 'axios';

const API_URL = 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store tokens in memory
let accessToken = null;
let refreshToken = null;

// Function to set tokens
export const setTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;
};

// Function to get tokens
export const getTokens = () => ({
  accessToken,
  refreshToken,
});

// Function to clear tokens
export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
};

// Prevent multiple refresh requests
let isRefreshing = false;

// Request interceptor - Add access token to requests
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry && refreshToken && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_URL}/refresh-token`, {
          refreshToken,
        });

        const { accessToken: newAccessToken } = response.data;
        accessToken = newAccessToken;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        isRefreshing = false;
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

