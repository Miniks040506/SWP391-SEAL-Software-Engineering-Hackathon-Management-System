import { apiRequest } from "@/api/apiRequest";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  ChangePasswordRequest,
  CreateGuestJudgeRequest,
  CreateUserRequest,
  GetUsersParams,
  GuestJudgeResponse,
  MyProfileResponse,
  RejectUserRequest,
  UpdateMyProfileRequest,
  UpdateUserRequest,
  UserApprovalResponse,
  UserApprovalResultResponse,
  UserDetailResponse,
  UserSummaryResponse,
} from "@/types/user.types";

export const userApi = {
  getUsers(params?: GetUsersParams) {
    return apiRequest.get<PageResponse<UserSummaryResponse>>("/users", {params});
  },

  getPendingApprovalUsers(params?: { page?: number; size?: number }) {
    return apiRequest.get<PageResponse<UserApprovalResponse>>(
      "/users/pending-approval",
      {params},
    );
  },

  getMyProfile() {
    return apiRequest.get<MyProfileResponse>("/users/me");
  },

  getUserById(userId: UUID) {
    return apiRequest.get<UserDetailResponse>(`/users/${userId}`);
  },

  createUser(payload: CreateUserRequest) {
    return apiRequest.post<UserDetailResponse>("/users", payload);
  },

  approveUser(userId: UUID) {
    return apiRequest.post<UserApprovalResultResponse>(`/users/${userId}/approve`);
  },

  rejectUser(userId: UUID, payload: RejectUserRequest) {
    return apiRequest.post<UserApprovalResultResponse>(
      `/users/${userId}/reject`,
      payload,
    );
  },

  createGuestJudge(payload: CreateGuestJudgeRequest) {
    return apiRequest.post<GuestJudgeResponse>("/users/guest-judge", payload);
  },

  updateUser(userId: UUID, payload: UpdateUserRequest) {
    return apiRequest.patch<UserDetailResponse>(`/users/${userId}`, payload);
  },

  deactivateUser(userId: UUID) {
    return apiRequest.patch<UserDetailResponse>(`/users/${userId}/deactivate`);
  },

  updateMyProfile(payload: UpdateMyProfileRequest) {
    return apiRequest.patch<MyProfileResponse>("/users/me", payload);
  },

  changeMyPassword(payload: ChangePasswordRequest) {
    return apiRequest.patch<void>("/users/me/password", payload);
  },
};
