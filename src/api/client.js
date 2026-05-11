import axios from 'axios';

const raw = import.meta.env.VITE_API_BASE_URL?.trim();
const baseURL = raw ? raw.replace(/\/$/, '') : '/api';

const api = axios.create({
  baseURL,
});

export default api;
