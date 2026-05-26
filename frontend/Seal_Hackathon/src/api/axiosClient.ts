import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";
import type { RefreshTokenResponse } from "@/types/auth.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = useAuthStore.getState().refreshToken;

    if (!refreshToken) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    try {
      originalRequest._retry = true;

      const response = await refreshClient.post<RefreshTokenResponse>(
        "/auth/refresh-token",
        { refreshToken },
      );

      const data = response.data;

      useAuthStore.getState().setTokens(data);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

      return axiosClient(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    }
  },
);
