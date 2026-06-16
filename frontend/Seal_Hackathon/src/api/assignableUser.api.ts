import { AxiosError } from "axios";

import { apiRequest } from "@/api/apiRequest";
import type { PageResponse, UUID } from "@/types/common.types";
import type { UserSummaryResponse } from "@/types/user.types";

export type AssignableUserRole = "MENTOR" | "JUDGE";

export type AssignableUserResponse = {
  userId: UUID;
  judgeId?: UUID | null;
  email: string;
  fullName: string;
  role: AssignableUserRole;
  status: string;
  judgeType?: "GUEST" | "INTERNAL" | string | null;
  guest?: boolean | null;
  temporary?: boolean | null;
  expiresAt?: string | null;
};

type AssignableCompatible = Partial<AssignableUserResponse> &
  Partial<UserSummaryResponse> & {
    id?: UUID;
    name?: string;
  };

function isAxiosStatus(error: unknown, status: number) {
  return error instanceof AxiosError && error.response?.status === status;
}

function normalizeAssignableUser(
  user: AssignableCompatible,
  role: AssignableUserRole,
): AssignableUserResponse {
  const userId = user.userId ?? user.id;

  if (!userId) {
    throw new Error("User response does not contain userId/id.");
  }

  // Important:
  // - MENTOR does not need judgeId.
  // - JUDGE should use judgeId from /users/assignable when available.
  // - If BE has no separate judge profile id, fallback to userId.
  const judgeId = role === "JUDGE" ? user.judgeId ?? userId : null;

  return {
    userId,
    judgeId,
    email: user.email ?? "",
    fullName: user.fullName ?? user.name ?? user.email ?? "Unnamed user",
    role,
    status: user.status ?? "ACTIVE",
    judgeType: user.judgeType ?? null,
    guest: user.guest ?? null,
    temporary: user.temporary ?? null,
    expiresAt: user.expiresAt ?? null,
  };
}

async function getAssignableUsersFromNewEndpoint(
  role: AssignableUserRole,
  search?: string,
) {
  const response = await apiRequest.get<AssignableCompatible[]>("/users/assignable", {
    params: {
      role,
      search: search?.trim() || undefined,
    },
  });

  return response.map((user) => normalizeAssignableUser(user, role));
}

async function getAssignableUsersFromUsersEndpoint(
  role: AssignableUserRole,
  search?: string,
) {
  const response = await apiRequest.get<PageResponse<UserSummaryResponse>>(
    "/users",
    {
      params: {
        role,
        status: "ACTIVE",
        search: search?.trim() || undefined,
        page: 0,
        size: 50,
      },
    },
  );

  return response.content.map((user) =>
    normalizeAssignableUser(user as AssignableCompatible, role),
  );
}

export const assignableUserApi = {
  async getAssignableUsers(role: AssignableUserRole, search?: string) {
    try {
      return await getAssignableUsersFromNewEndpoint(role, search);
    } catch (error) {
      if (isAxiosStatus(error, 404)) {
        return getAssignableUsersFromUsersEndpoint(role, search);
      }

      throw error;
    }
  },
};
