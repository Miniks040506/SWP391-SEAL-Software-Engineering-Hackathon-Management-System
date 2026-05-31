export type UserRole =
  | "ADMIN"
  | "COORDINATOR"
  | "JUDGE"
  | "MENTOR"
  | "PARTICIPANT"
  | "STUDENT";

export type StudentType = "FPT" | "EXTERNAL";

export type AuthUser = {
  id?: string;
  userId?: string;
  email: string;
  fullName: string;
  role?: UserRole;
  roles?: UserRole[];
  status?: string;
  avatarUrl?: string | null;
};

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
  status: string;
  verificationExpiresInSeconds?: number;
  message: string;
};

export type VerifyEmailRequest = {
  email: string;
  code: string;
};

export type VerifyEmailResponse = {
  userId: string;
  email: string;
  status: string;
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
  status: string;
  avatarUrl?: string | null;
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

export type AuthMessageResponse = {
  message: string;
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
