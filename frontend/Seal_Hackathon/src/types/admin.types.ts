import type { UserRole } from "@/types/auth.types";

export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BANNED";

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type UserSummaryResponse = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
};

export type UserDetailResponse = {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  roleProfile?: unknown;
};

export type AdminUser = UserDetailResponse;
export type AdminUserSummary = UserSummaryResponse;

export type AdminUserListParams = {
  search?: string;
  role?: UserRole | "";
  status?: UserStatus | "";
  page?: number;
  pageSize?: number;
};

export type CreateUserRequest = {
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  password: string;
};

export type UpdateUserRequest = {
  fullName?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  avatarUrl?: string;
};

export type AdminResetPasswordRequest = {
  newPassword: string;
};