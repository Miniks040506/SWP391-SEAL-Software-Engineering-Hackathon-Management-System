import { useQuery } from "@tanstack/react-query";

import { userApi } from "@/api/user.api";
import type { PageResponse } from "@/types/common.types";
import type { UserSummaryResponse } from "@/types/user.types";

type UseCoordinatorUsersQueryParams = {
  role: string;
  search: string;
  enabled?: boolean;
};

export function useCoordinatorUsersQuery({
  role,
  search,
  enabled = true,
}: UseCoordinatorUsersQueryParams) {
  return useQuery({
    queryKey: ["coordinator-users", role, search],
    queryFn: () =>
      userApi.getUsers({
        role,
        status: "ACTIVE",
        search: search.trim() || undefined,
        page: 0,
        size: 20,
      }),
    enabled,
    staleTime: 30_000,
  });
}

export function getPageItems<T>(page?: PageResponse<T>): T[] {
  const pageData = page as
    | {
        content?: T[];
        items?: T[];
        data?: T[];
      }
    | undefined;

  return pageData?.content ?? pageData?.items ?? pageData?.data ?? [];
}

export type CoordinatorUserOption = UserSummaryResponse;
