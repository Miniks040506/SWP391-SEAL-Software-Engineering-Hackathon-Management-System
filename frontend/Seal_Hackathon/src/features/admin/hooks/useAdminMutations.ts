import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin.api";
import type { AdminUserListParams, UpdateUserRequest } from "@/types/admin.types";

const ADMIN_USERS_KEY = "admin-users";

export function useAdminUsersQuery(params: AdminUserListParams) {
  return useQuery({
    queryKey: [ADMIN_USERS_KEY, params],
    queryFn: () => adminApi.listUsers(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminUserQuery(userId: string | null) {
  return useQuery({
    queryKey: [ADMIN_USERS_KEY, userId],
    queryFn: () => adminApi.getUser(userId!),
    enabled: Boolean(userId),
  });
}

export function useCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] }),
  });
}

export function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserRequest }) =>
      adminApi.updateUser(userId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] }),
  });
}

export function useDeactivateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deactivateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] }),
  });
}

export function useActivateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      adminApi.updateUser(userId, { status: "ACTIVE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] }),
  });
}

export function useResetUserPasswordMutation() {
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      adminApi.resetPassword(userId, newPassword),
  });
}