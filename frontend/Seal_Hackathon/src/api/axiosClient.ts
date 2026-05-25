import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

type RefreshTokenResponse = {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresInMs: number;
    refreshTokenExpiresInMs: number;
};

type RetryConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

export const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15_000,
});

axiosClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryConfig | undefined;
        
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            
            const refreshToken = useAuthStore.getState().refreshToken;
            
            if (!refreshToken) {
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(error);
            }
            
            try {
                const response = await axios.post<RefreshTokenResponse>(
                    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
                    { refreshToken }
                );
                
                useAuthStore.getState()
                    .setTokens(response.data.accessToken, response.data.refreshToken);
                    
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                return axiosClient(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);           
    }
);