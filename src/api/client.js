import axios from 'axios';
import Cookies from 'js-cookie';

const API_ROOT_URL = 'https://api.devstorm.dev';
const API_BASE_URL = `${API_ROOT_URL}/api`;

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
  (config) => {
    const token = getStoredAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const payload = error.response?.data;

    if (status === 401) {
      clearAuthToken();
      window.dispatchEvent(new CustomEvent('authError', {
        detail: { message: 'Session expired. Please login again.' },
      }));

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
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
