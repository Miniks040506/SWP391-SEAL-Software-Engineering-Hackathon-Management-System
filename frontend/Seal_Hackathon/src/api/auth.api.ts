// auth.api.ts
import { axiosClient } from "@/api/axiosClient";
import type {
  AuthMessageResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from "@/types/auth.types";

export const authApi = {
  register(payload: RegisterRequest) {
    return axiosClient
      .post<RegisterResponse>("/auth/register", payload)
      .then((res) => res.data);
  },

  verifyEmail(payload: VerifyEmailRequest) {
    return axiosClient
      .post<VerifyEmailResponse>("/auth/verify-email", payload)
      .then((res) => res.data);
  },

  resendVerification(payload: ResendVerificationRequest) {
    return axiosClient
      .post<AuthMessageResponse>("/auth/resend-verification", payload)
      .then((res) => res.data);
  },

  login(payload: LoginRequest) {
    return axiosClient
      .post<LoginResponse>("/auth/login", payload)
      .then((res) => res.data);
  },

  refreshToken(payload: RefreshTokenRequest) {
    return axiosClient
      .post<RefreshTokenResponse>("/auth/refresh-token", payload)
      .then((res) => res.data);
  },

  logout() {
    return axiosClient.post<void>("/auth/logout").then((res) => res.data);
  },

  forgotPassword(payload: ForgotPasswordRequest) {
    return axiosClient
      .post<AuthMessageResponse>("/auth/forgot-password", payload)
      .then((res) => res.data);
  },

  resetPassword(payload: ResetPasswordRequest) {
    return axiosClient
      .post<AuthMessageResponse>("/auth/reset-password", payload)
      .then((res) => res.data);
  },

  getOAuth2AuthorizationUrl(provider: "google" | "github") {
    return `${import.meta.env.VITE_API_BASE_URL}/auth/oauth2/authorization/${provider}`;
  },
};