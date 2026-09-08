import axios from 'axios';

const configuredUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const baseURL = configuredUrl.replace(/\/$/, '').endsWith('/api')
  ? configuredUrl.replace(/\/$/, '')
  : `${configuredUrl.replace(/\/$/, '')}/api`;

const api = axios.create({ baseURL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('authToken')) {
      window.dispatchEvent(new Event('shopboard:session-expired'));
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond.';
  if (!error.response) return 'Unable to reach the server. Check your connection and API URL.';
  return error.response.data?.message || error.response.data?.msg || fallback;
}

export default api;
