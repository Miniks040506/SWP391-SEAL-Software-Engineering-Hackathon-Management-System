import { axiosClient } from "@/api/axiosClient";
import type {
  AuthMessageResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "@/types/auth.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

const request = {
  get: <T>(url: string) => axiosClient.get<T>(url) as unknown as Promise<T>,
  post: <T>(url: string, data?: unknown) =>
    axiosClient.post<T>(url, data) as unknown as Promise<T>,
};

export const authApi = {
  register(payload: RegisterRequest) {
    return request.post<RegisterResponse>("/auth/register", payload);
  },

  verifyEmail(payload: VerifyEmailRequest) {
    return request.post<VerifyEmailResponse>("/auth/verify-email", payload);
  },

  resendVerification(payload: ResendVerificationRequest) {
    return request.post<AuthMessageResponse>("/auth/resend-verification", payload);
  },

  login(payload: LoginRequest) {
    return request.post<LoginResponse>("/auth/login", payload);
  },

  refreshToken(refreshToken: string) {
    return request.post<RefreshTokenResponse>("/auth/refresh-token", {
      refreshToken,
    });
  },

  logout() {
    return request.post<void>("/auth/logout");
  },

  forgotPassword(payload: ForgotPasswordRequest) {
    return request.post<AuthMessageResponse>("/auth/forgot-password", payload);
  },

  resetPassword(payload: ResetPasswordRequest) {
    return request.post<AuthMessageResponse>("/auth/reset-password", payload);
  },

  loginWithGoogle() {
    window.location.href = `${API_BASE_URL}/auth/oauth2/authorization/google`;
  },

  loginWithGithub() {
    window.location.href = `${API_BASE_URL}/auth/oauth2/authorization/github`;
  },
};
