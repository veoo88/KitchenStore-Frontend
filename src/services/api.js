import axios from 'axios';
import { safeJsonParse } from '../utils/format';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5256/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const user = safeJsonParse(localStorage.getItem('currentUser'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout if 401 response returned from api
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
