import axios from 'axios';

const configuredUrl = import.meta.env.VITE_API_URL || '/api';
const baseURL = configuredUrl.replace(/\/$/, '').endsWith('/api')
  ? configuredUrl.replace(/\/$/, '')
  : `${configuredUrl.replace(/\/$/, '')}/api`;

let accessToken = null;
let refreshPromise = null;

const refreshClient = axios.create({ baseURL, timeout: 15000, withCredentials: true });
const api = axios.create({ baseURL, timeout: 15000, withCredentials: true });

export function setAccessToken(token) {
  accessToken = token || null;
}

export async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = refreshClient.post('/users/refresh')
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        return data;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const publicAuthRequest = ['/users/login', '/users/register', '/users/password-reset/request', '/users/password-reset/confirm']
      .some((path) => request?.url?.endsWith(path));
    const authFailure = ['AUTH_REQUIRED', 'INVALID_TOKEN'].includes(error.response?.data?.code);
    if (error.response?.status !== 401 || !authFailure || request?._retry || request?.skipAuthRefresh || publicAuthRequest) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      await refreshSession();
      request.headers.Authorization = `Bearer ${accessToken}`;
      return api(request);
    } catch (refreshError) {
      setAccessToken(null);
      window.dispatchEvent(new Event('shopboard:session-expired'));
      return Promise.reject(refreshError);
    }
  },
);

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond.';
  if (!error.response) return 'Unable to reach the server. Check your connection and API URL.';
  return error.response.data?.message || error.response.data?.msg || fallback;
}

export default api;
