import axios from 'axios';
import { useAuthStore } from '../../modules/auth/stores/auth.store';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

// Adjunta el JWT (una vez que IAM lo emita) a cada request.
httpClient.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});
