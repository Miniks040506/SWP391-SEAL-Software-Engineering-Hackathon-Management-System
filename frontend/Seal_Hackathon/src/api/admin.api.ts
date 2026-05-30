import { apiRequest } from "./apiRequest";
import type { PageResponse } from "@/types/common.types";
import type {
  AdminUserListParams,
  CreateUserRequest,
  UpdateUserRequest,
  UserDetailResponse,
  UserSummaryResponse,
} from "@/types/user.types";

export const adminApi = {
  listUsers(params: AdminUserListParams): Promise<PageResponse<UserSummaryResponse>> {
    const { page = 1, pageSize, ...rest } = params;
    return apiRequest.get("/users", {
      params: {
        ...rest,
        page: page - 1, // Spring is 0-based
        size: pageSize,
      },
    });
  },

  getUser(userId: string): Promise<UserDetailResponse> {
    return apiRequest.get(`/users/${userId}`);
  },

  createUser(payload: CreateUserRequest): Promise<UserDetailResponse> {
    return apiRequest.post("/users", payload);
  },

  updateUser(userId: string, payload: UpdateUserRequest): Promise<UserDetailResponse> {
    return apiRequest.patch(`/users/${userId}`, payload);
  },

  deactivateUser(userId: string): Promise<UserDetailResponse> {
    return apiRequest.patch(`/users/${userId}/deactivate`);
  },

  resetPassword(userId: string, newPassword: string): Promise<void> {
    return apiRequest.post(`/users/${userId}/reset-password`, { newPassword });
  },
};