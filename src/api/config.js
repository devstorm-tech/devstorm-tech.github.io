const normalizeApiBaseUrl = (value = '') => {
  const trimmed = String(value || '').trim().replace(/\/+$/, '');

  if (!trimmed) {
    return 'https://api.devstorm.dev/api';
  }

  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const getEnvApiBaseUrl = () => {
  const viteBaseUrl = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || ''
    : '';

  const craBaseUrl = typeof process !== 'undefined' ? process.env?.REACT_APP_API_BASE_URL || '' : '';

  return viteBaseUrl || craBaseUrl || 'https://api.devstorm.dev';
};

export const API_BASE_URL = normalizeApiBaseUrl(getEnvApiBaseUrl());
export const API_ROOT_URL = API_BASE_URL.replace(/\/api$/, '');

export const buildApiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
