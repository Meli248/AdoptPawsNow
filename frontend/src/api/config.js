import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // For cookies/auth
});

// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Forbidden
          console.error('❌ Access forbidden');
          break;
          
        case 404:
          // Not found
          console.error('❌ Resource not found');
          break;
          
        case 500:
          // Server error
          console.error('❌ Server error:', data.message);
          break;
          
        default:
          console.error(`❌ Error ${status}:`, data.message);
      }
      
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('❌ No response from server');
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
      return Promise.reject({ message: error.message });
    }
  }
);

export default apiClient;