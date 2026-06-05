// src/api.js
import axios from 'axios';
import i18n from '@/i18n';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    language: i18n.language,
  };
  return config;
});

export default api;