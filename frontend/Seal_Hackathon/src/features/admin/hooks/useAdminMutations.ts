import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/user.api";
import type {
  AdminUserListParams,
  UpdateUserRequest,
} from "@/types/user.types";

const ADMIN_USERS_KEY = "admin-users";

export function useAdminUsersQuery(params: AdminUserListParams) {
  const { page = 1, pageSize, ...rest } = params;
  return useQuery({
    queryKey: [ADMIN_USERS_KEY, params],
    queryFn: () =>
      userApi.getUsers({
        ...rest,
        page: page - 1, // Spring is 0-based
        size: pageSize,
      }),
    placeholderData: (prev) => prev,
  });
}

export function useAdminUserQuery(userId: string | null) {
  return useQuery({
    queryKey: [ADMIN_USERS_KEY, userId],
    queryFn: () => userApi.getUserById(userId!),
    enabled: Boolean(userId),
  });
}

export function useCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] }),
  });
}

export function useCreateGuestJudgeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.createGuestJudge,
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] }),
  });
}

export function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateUserRequest;
    }) => userApi.updateUser(userId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] }),
  });
}

export function useDeactivateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.deactivateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] }),
  });
}

export function useActivateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      userApi.updateUser(userId, { status: "ACTIVE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] }),
  });
}