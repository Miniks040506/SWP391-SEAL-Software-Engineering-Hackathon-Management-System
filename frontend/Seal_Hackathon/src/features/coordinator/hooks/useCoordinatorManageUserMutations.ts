import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/user.api";

import type {
  AdminUserListParams,
  UpdateUserRequest,
  CreateGuestJudgeRequest
} from "@/types/user.types";

const COORDINATOR_USERS_KEY = "coordinator-users";

export function useCoordinatorUsersQuery(params: AdminUserListParams) {
  const { page = 1, pageSize, ...rest } = params;
  return useQuery({
    queryKey: [COORDINATOR_USERS_KEY, params],
    queryFn: () =>
      userApi.getUsers({
        ...rest,
        page: page - 1,
        size: pageSize,
      }),
    placeholderData: (prev) => prev,
  });
}

export function useCoordinatorUserQuery(userId: string | null) {
  return useQuery({
    queryKey: [COORDINATOR_USERS_KEY, userId],
    queryFn: () => userApi.getUserById(userId!),
    enabled: Boolean(userId),
  });
}

export function useCoordinatorCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [COORDINATOR_USERS_KEY] }),
  });
}

export function useCoordinatorUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateUserRequest;
    }) => userApi.updateUser(userId, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [COORDINATOR_USERS_KEY] }),
  });
}

export function useCoordinatorDeactivateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.deactivateUser,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [COORDINATOR_USERS_KEY] }),
  });
}

export function useCoordinatorActivateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      userApi.updateUser(userId, { status: "ACTIVE" }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [COORDINATOR_USERS_KEY] }),
  });
}

export function useCreateGuestJudgeMutation() {
  return useMutation({
    mutationFn: (payload: CreateGuestJudgeRequest) => userApi.createGuestJudge(payload),
  });
}