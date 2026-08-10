import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL && typeof window !== 'undefined') {
  console.warn(
    'VITE_API_URL environment variable is not set. ' +
    'Frontend-backend communication may fail. ' +
    'Set VITE_API_URL in your .env file (e.g., http://localhost:5001/api/v1)'
  );
}

const client = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:5001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle rate limiting (429) and token refresh on 401
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry on 429 (Too Many Requests) with exponential backoff
    if (error.response?.status === 429) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      const maxRetries = 3;

      if (originalRequest._retryCount <= maxRetries) {
        const delay = Math.pow(2, originalRequest._retryCount) * 1000; // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay));
        return client(originalRequest);
      }
    }

    // Handle token refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return client(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
