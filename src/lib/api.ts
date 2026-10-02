import axios, { AxiosInstance } from 'axios';
import { authStorage } from './auth-storage';

// API Geral / Consultas acadêmicas (Porta 8009)
const rawBase = import.meta.env.VITE_URL_GERAL || '';
export const baseURL = rawBase
  ? rawBase.endsWith('/')
    ? rawBase
    : `${rawBase}/`
  : '';

// API Secundária (ODA)
const rawBase2 = import.meta.env.VITE_URL_GERAL2 || '';
export const baseURL2 = rawBase2
  ? rawBase2.endsWith('/')
    ? rawBase2
    : `${rawBase2}/`
  : '';

// API Administrativa e Autenticação (Porta 8000)
const rawBaseAdmin = import.meta.env.VITE_URL_ADMIN || 'http://localhost:8000/';
export const baseURLAdmin = rawBaseAdmin
  ? rawBaseAdmin.endsWith('/')
    ? rawBaseAdmin
    : `${rawBaseAdmin}/`
  : 'http://localhost:8000/';

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

export const apiOda = axios.create({
  baseURL: baseURL2,
  timeout: 15000,
});

export const apiAdmin = axios.create({
  baseURL: baseURLAdmin,
  timeout: 15000,
});

export const hasOdaBase = () => Boolean(baseURL2);

// Fila de requisições pendentes para refresh concorrente
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Configura interceptors de injeção de token e refresh automático em uma instância Axios
const setupAuthInterceptors = (instance: AxiosInstance) => {
  // Request Interceptor: normaliza rota e injeta Bearer Token se existir
  instance.interceptors.request.use((config) => {
    // Se a baseURL possuir subcaminho (ex: /simcc/admin/), remove a barra inicial relativa para não truncar o subcaminho
    if (
      config.url &&
      config.url.startsWith('/') &&
      !config.url.startsWith('//')
    ) {
      config.url = config.url.replace(/^\//, '');
    }
    const token = authStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response Interceptor: captura 401 e tenta refresh via apiAdmin
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('auth/token') &&
        !originalRequest.url?.includes('auth/refresh_token')
      ) {
        const currentToken = authStorage.getToken();
        if (!currentToken) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return instance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data } = await axios.post(
            `${baseURLAdmin}auth/refresh_token`,
            {},
            {
              headers: {
                Authorization: `Bearer ${currentToken}`,
              },
            },
          );

          const newToken = data.access_token;
          authStorage.setToken(newToken);
          processQueue(null, newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          authStorage.removeToken();
          window.dispatchEvent(new CustomEvent('simcc:auth-expired'));
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
};

// Aplica interceptors nas instâncias necessárias
setupAuthInterceptors(api);
setupAuthInterceptors(apiAdmin);
