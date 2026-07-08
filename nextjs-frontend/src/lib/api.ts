import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import { useAuthStore } from '@/store/authStore';

type RefreshPromise = Promise<string | null> | null;
type ErrorCallback = (error: AxiosError) => void;

let onApiError: ErrorCallback | null = null;

export function setOnApiError(callback: ErrorCallback | null) {
  onApiError = callback;
}

export function getApiErrorMessage(error: AxiosError): string {
  const data = error.response?.data as
    | { error?: { message?: string } }
    | { message?: string }
    | undefined;
  if (data && 'error' in data && data.error?.message) return data.error.message;
  const msg = (data as { message?: string } | undefined)?.message;
  return msg || (error.response?.status === 404 ? 'منبع مورد نظر یافت نشد' : 'خطایی در ارتباط با سرور رخ داد');
}

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.response?.status === 429 ||
      (error.response?.status !== undefined && error.response.status >= 500)
    );
  },
  onRetry: (retryCount, error) => {
    console.warn(`[api] retry ${retryCount}/3 after ${error.response?.status || 'network error'}`);
  },
});

let refreshPromise: RefreshPromise = null;

async function refreshToken(): Promise<string | null> {
  try {
    const res = await axios.post(
      `${api.defaults.baseURL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    const newToken: string = res.data.data?.token || res.data.token;
    const user = useAuthStore.getState().user;
    if (user) {
      useAuthStore.getState().setAuth(newToken, user);
    }
    return newToken;
  } catch {
    useAuthStore.getState().logout();
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      window.location.href = '/login';
    }
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    if (status === 401) {
      const skipRefresh = ['/auth/me', '/auth/refresh', '/auth/login', '/auth/register'];
      if (skipRefresh.some((p) => url.includes(p))) {
        return Promise.reject(error);
      }
      if (!refreshPromise) {
        refreshPromise = refreshToken();
      }
      const newToken = await refreshPromise;
      refreshPromise = null;
      if (newToken && error.config) {
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api(error.config);
      }
    }

    onApiError?.(error);

    return Promise.reject(error);
  },
);

export interface ApiResponse<T> {
  data: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.get<ApiResponse<T>>(url, config);
  return res.data.data;
}

export async function apiPost<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.post<ApiResponse<T>>(url, body, config);
  return res.data.data;
}

export async function apiPut<T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.put<ApiResponse<T>>(url, body, config);
  return res.data.data;
}

export async function apiDelete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.delete<ApiResponse<T>>(url, config);
  return res.data.data;
}

export default api;
