import type { ISODateTime, UUID } from "@/types/common.types";

export type CreateUserRequest = {
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  status: string;
};

export type UpdateUserRequest = {
  fullName?: string;
  phone?: string;
  role?: string;
  status?: string;
  avatarUrl?: string;
};

export type RejectUserRequest = {
  reason: string;
};

export type CreateGuestJudgeRequest = {
  email: string;
  fullName: string;
  affiliation?: string;
  expertise?: string;
  temporaryAccountExpiresAt?: ISODateTime;
};

export type UpdateMyProfileRequest = {
  fullName: string;
  phone?: string;
  avatarUrl?: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type UserSummaryResponse = {
  id: UUID;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: ISODateTime;
};

export type UserApprovalResponse = {
  id: UUID;
  email: string;
  fullName: string;
  studentType: string;
  universityName: string;
  emailVerifiedAt: ISODateTime;
};

export type UserApprovalResultResponse = {
  userId: UUID;
  status: string;
  message: string;
};

export type GuestJudgeResponse = {
  userId: UUID;
  judgeId: UUID;
  email: string;
  temporaryPasswordLink: string;
  expiresAt: ISODateTime;
};

export type MyProfileResponse = {
  id: UUID;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  status: string;
};

export type UserDetailResponse = {
  id: UUID;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  status: string;
  avatarUrl?: string;
  emailVerifiedAt?: ISODateTime;
  lastLoginAt?: ISODateTime;
  roleProfile?: unknown;
};

export type GetUsersParams = {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  size?: number;
};

// admin
export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BANNED";

export type AdminUserListParams = {
  search?: string;
  role?: string;
  status?: UserStatus | "";
  page?: number;
  pageSize?: number;
};

export type AdminResetPasswordRequest = {
  newPassword: string;
};