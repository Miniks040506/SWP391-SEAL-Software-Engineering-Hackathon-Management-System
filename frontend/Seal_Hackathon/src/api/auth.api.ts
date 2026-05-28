import { apiRequest } from "./apiRequest";
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

export const authApi = {
  register(payload: RegisterRequest) {
    return apiRequest.post<RegisterResponse>("/auth/register", payload);
  },

  verifyEmail(payload: VerifyEmailRequest) {
    return apiRequest.post<VerifyEmailResponse>("/auth/verify-email", payload);
  },

  resendVerification(payload: ResendVerificationRequest) {
    return apiRequest.post<AuthMessageResponse>("/auth/resend-verification", payload);
  },

  login(payload: LoginRequest) {
    return apiRequest.post<LoginResponse>("/auth/login", payload);
  },

  refreshToken(refreshToken: string) {
    return apiRequest.post<RefreshTokenResponse>("/auth/refresh-token", {
      refreshToken,
    });
  },

  logout() {
    return apiRequest.post<void>("/auth/logout");
  },

  forgotPassword(payload: ForgotPasswordRequest) {
    return apiRequest.post<AuthMessageResponse>("/auth/forgot-password", payload);
  },

  resetPassword(payload: ResetPasswordRequest) {
    return apiRequest.post<AuthMessageResponse>("/auth/reset-password", payload);
  },

  loginWithGoogle() {
    window.location.href = `${API_BASE_URL}/auth/oauth2/authorization/google`;
  },

  loginWithGithub() {
    window.location.href = `${API_BASE_URL}/auth/oauth2/authorization/github`;
  },
};
