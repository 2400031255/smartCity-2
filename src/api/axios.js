import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 (expired / invalid token)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.dispatchEvent(new Event('session:expired'));
    }
    return Promise.reject(err);
  }
);

export default API;
