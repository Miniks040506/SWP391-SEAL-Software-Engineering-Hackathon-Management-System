export type UserRole =
  | "STUDENT"
  | "JUDGE"
  | "MENTOR"
  | "COORDINATOR"
  | "ADMIN";

export type UserStatus =
  | "UNVERIFIED"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "SUSPENDED"
  | "DEACTIVATED";

export type StudentType = "FPT" | "EXTERNAL";

export type RegisterRequest = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  studentType: StudentType;
  studentCode?: string;
  universityName?: string;
  major?: string;
  graduationYear?: number;
};

export type RegisterResponse = {
  userId: string;
  email: string;
  status: UserStatus;
  verificationExpiresInSeconds: number;
  message: string;
};

export type VerifyEmailRequest = {
  email: string;
  code: string;
};

export type VerifyEmailResponse = {
  userId: string;
  email: string;
  status: UserStatus;
  message: string;
};

export type ResendVerificationRequest = {
  email: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInMs: number;
  refreshTokenExpiresInMs: number;
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInMs: number;
  refreshTokenExpiresInMs: number;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
};

export type AuthMessageResponse = {
  message: string;
};

export type ApiErrorResponse = {
  success?: boolean;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  timestamp?: string;
  fieldErrors?: {
    field: string;
    message: string;
  }[];
};

export type AuthUser = {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};