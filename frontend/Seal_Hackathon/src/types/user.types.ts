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
export type UserStatus =
  | "UNVERIFIED"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "SUSPENDED"
  | "DEACTIVATED";

export type AdminUserListParams = {
  search?: string;
  role?: string;
  status?: UserStatus | "";
  page?: number;
  pageSize?: number;
};

export type AdminUserStats = {
  adminCount: number;
  studentCount: number;
  mentorCount: number;
  judgeCount: number;
  coordinatorCount: number;
  totalCount: number;
  pendingApprovalCount: number;
  suspendedCount: number;
};

export type RecentActivity = {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: "USER_CREATED" | "USER_APPROVED" | "USER_SUSPENDED" | "USER_ACTIVATED" | "ROLE_CHANGED";
};

export type PendingAction = {
  id: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  count: number;
  actionLabel: string;
  route: string;
};

export type AdminDashboardData = {
  stats: AdminUserStats;
  recentActivity: RecentActivity[];
  pendingActions: PendingAction[];
};

export type AssignableUserRole = "MENTOR" | "JUDGE";

export type AssignableUserResponse = {
  userId: UUID;
  judgeId?: UUID | null;
  email: string;
  fullName: string;
  role: AssignableUserRole;
  status: string;
};
