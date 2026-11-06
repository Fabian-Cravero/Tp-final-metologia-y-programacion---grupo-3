import axios from 'axios';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

/**
 * El cliente no importa el store de sesión (evita un import circular): main.ts le pasa
 * cómo leer el token y qué hacer cuando el backend responde 401.
 */
let obtenerToken: () => string | null = () => null;
let alExpirarSesion: () => void = () => {};

export function conectarSesion(opciones: { obtenerToken: () => string | null; alExpirarSesion: () => void }) {
  obtenerToken = opciones.obtenerToken;
  alExpirarSesion = opciones.alExpirarSesion;
}

// Adjunta el JWT a cada request.
httpClient.interceptors.request.use((config) => {
  const token = obtenerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 en una ruta protegida = token vencido o inválido: se cierra la sesión y se vuelve al login.
httpClient.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const esLogin = String(error?.config?.url ?? '').includes('/iam/login');
    if (error?.response?.status === 401 && !esLogin) alExpirarSesion();
    return Promise.reject(error);
  },
);
