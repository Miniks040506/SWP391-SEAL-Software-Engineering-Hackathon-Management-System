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
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string;
};

export type UserDetailResponse = {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  studentType?: "FPT" | "EXTERNAL";
  studentCode?: string;
  universityName?: string;
  major?: string;
  graduationYear?: number;
  lastLoginAt?: string;
  createdAt: string;
};

/** Full user record - maps to UserDetailResponse */
export type AdminUser = UserDetailResponse;

/** List-level user record - maps to UserSummaryResponse */
export type AdminUserSummary = UserSummaryResponse;

// Request types

export type AdminUserListParams = {
  search?: string;
  role?: UserRole | "";
  status?: UserStatus | "";
  page?: number;
  pageSize?: number;
};

export type CreateUserRequest = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  studentType?: "FPT" | "EXTERNAL";
  studentCode?: string;
  universityName?: string;
  major?: string;
  graduationYear?: number;
};

export type UpdateUserRequest = {
  fullName?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  studentCode?: string;
  universityName?: string;
  major?: string;
  graduationYear?: number;
};

export type AdminResetPasswordRequest = {
  userId: string;
  newPassword: string;
  confirmPassword: string;
};