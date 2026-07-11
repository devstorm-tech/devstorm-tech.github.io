import axios from 'axios';
import Cookies from 'js-cookie';
import { API_BASE_URL } from './config';

let csrfToken = '';
let isRefreshingCsrf = false;
let pendingQueue = [];

const getStoredAuthToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  const candidates = [
    Cookies.get('auth_token'),
    Cookies.get('token'),
    sessionStorage.getItem('auth_token'),
    sessionStorage.getItem('token'),
    localStorage.getItem('auth_token'),
    localStorage.getItem('token'),
  ];

  return candidates.find(Boolean) || '';
};

export const setAuthToken = (token, persist = false) => {
  if (typeof window === 'undefined') {
    return;
  }

  const isSecure = window.location.protocol === 'https:';
  const cookieOptions = {
    path: '/',
    sameSite: 'strict',
    secure: isSecure,
  };

  if (token) {
    Cookies.set('auth_token', token, cookieOptions);
    if (persist) {
      localStorage.setItem('auth_token', token);
    } else {
      sessionStorage.setItem('auth_token', token);
    }
    localStorage.setItem('auth_token', token);
    sessionStorage.setItem('auth_token', token);
  } else {
    Cookies.remove('auth_token', { path: '/' });
    Cookies.remove('token', { path: '/' });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('token');
  }
};

export const clearAuthToken = () => {
  setAuthToken('');
};

export const fetchCsrfToken = async () => {
  if (csrfToken) {
    return csrfToken;
  }

  if (isRefreshingCsrf) {
    return new Promise((resolve) => {
      pendingQueue.push(resolve);
    });
  }

  isRefreshingCsrf = true;
  try {
    const response = await apiClient.get('/csrf-token');
    csrfToken = response?.data?.csrfToken || '';
    return csrfToken;
  } catch (error) {
    csrfToken = '';
    return '';
  } finally {
    isRefreshingCsrf = false;
    pendingQueue.forEach((resolve) => resolve(csrfToken));
    pendingQueue = [];
  }
};

export const bootstrapCsrf = async () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return fetchCsrfToken();
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = getStoredAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      const tokenValue = await fetchCsrfToken();
      if (tokenValue) {
        config.headers['x-csrf-token'] = tokenValue;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const payload = error.response?.data;
    const config = error.config;

    if (status === 401) {
      clearAuthToken();
      window.dispatchEvent(new CustomEvent('authError', {
        detail: { message: 'Session expired. Please login again.' },
      }));

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (status === 403 && payload?.message?.toLowerCase().includes('csrf') && !config.__isRetry) {
      csrfToken = '';
      const token = await fetchCsrfToken();
      if (token) {
        config.__isRetry = true;
        config.headers['x-csrf-token'] = token;
        return apiClient(config);
      }
    }

    if (status === 403 && payload?.verified === false) {
      window.dispatchEvent(new CustomEvent('authError', {
        detail: { message: payload.message || 'Email verification required.' },
      }));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
