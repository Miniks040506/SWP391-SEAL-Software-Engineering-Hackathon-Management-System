import type { AxiosRequestConfig } from "axios";
import { axiosClient } from "@/api/axiosClient";

export const apiRequest = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosClient.get<T>(url, config) as unknown as Promise<T>,

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosClient.post<T>(url, data, config) as unknown as Promise<T>,

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosClient.patch<T>(url, data, config) as unknown as Promise<T>,

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosClient.put<T>(url, data, config) as unknown as Promise<T>,

  delete: <T = void>(url: string, config?: AxiosRequestConfig) =>
    axiosClient.delete<T>(url, config) as unknown as Promise<T>,
};