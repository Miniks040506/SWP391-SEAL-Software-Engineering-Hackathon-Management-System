import type {
  AdminUserListParams,
  PageResponse,
  UserSummaryResponse,
  UserDetailResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/types/admin.types";

const BASE = "/api/v1";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { response: { data: body, status: res.status } };
  }

  return res.json() as Promise<T>;
}

function toQueryString(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.append(key, String(value));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export const adminApi = {
  /** GET /api/v1/users */
  listUsers(params: AdminUserListParams): Promise<PageResponse<UserSummaryResponse>> {
    const { page = 1, pageSize, ...rest } = params;
    return request(
      `${BASE}/users${toQueryString({
        ...rest,
        page: page - 1, // Spring is 0-based
        size: pageSize,
      })}`,
    );
  },

  /** GET /api/v1/users/:id */
  getUser(userId: string): Promise<UserDetailResponse> {
    return request(`${BASE}/users/${userId}`);
  },

  /** POST /api/v1/users */
  createUser(payload: CreateUserRequest): Promise<UserDetailResponse> {
    return request(`${BASE}/users`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** PATCH /api/v1/users/:id */
  updateUser(userId: string, payload: UpdateUserRequest): Promise<UserDetailResponse> {
    return request(`${BASE}/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /** PATCH /api/v1/users/:id/deactivate */
  deactivateUser(userId: string): Promise<UserDetailResponse> {
    return request(`${BASE}/users/${userId}/deactivate`, {
      method: "PATCH",
    });
  },

  /** POST /api/v1/users/:id/reset-password */
  resetPassword(userId: string, newPassword: string): Promise<void> {
    return request(`${BASE}/users/${userId}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    });
  },
};