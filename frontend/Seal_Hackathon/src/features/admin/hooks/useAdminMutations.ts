import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminUserListParams, UpdateUserRequest } from "@/types/user.types";

const ADMIN_USERS_KEY = "admin-users";

// ==========================================
// MOCK DATABASE MÔ PHỎNG BACKEND
// ==========================================
let MOCK_USERS: any[] = [
  { id: "usr_a1b2c3d4", fullName: "System Admin", email: "admin@seal.com", phone: "0901234567", role: "ADMIN", status: "ACTIVE", lastLoginAt: new Date().toISOString() },
  { id: "usr_b2c3d4e5", fullName: "Nguyen Van A", email: "student_a@fpt.edu.vn", role: "STUDENT", status: "ACTIVE", lastLoginAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "usr_c3d4e5f6", fullName: "Tran Thi B", email: "student_b@fpt.edu.vn", role: "STUDENT", status: "PENDING_APPROVAL" },
  { id: "usr_d4e5f6g7", fullName: "Le Quang Mentor", email: "mentor1@company.com", role: "MENTOR", status: "ACTIVE", lastLoginAt: new Date(Date.now() - 5000000).toISOString() },
  { id: "usr_e5f6g7h8", fullName: "Pham Judge", email: "judge1@expert.com", role: "JUDGE", status: "UNVERIFIED" },
  { id: "usr_f6g7h8i9", fullName: "Hoang Coordinator", email: "coord@event.com", role: "COORDINATOR", status: "ACTIVE" },
  { id: "usr_g7h8i9j0", fullName: "Dinh Student X", email: "student_x@fpt.edu.vn", role: "STUDENT", status: "DEACTIVATED" },
  { id: "usr_h8i9j0k1", fullName: "Vu Mentor", email: "mentor2@company.com", role: "MENTOR", status: "SUSPENDED" },
  { id: "usr_i9j0k1l2", fullName: "Ngo Judge", email: "judge2@expert.com", role: "JUDGE", status: "ACTIVE" },
  { id: "usr_j0k1l2m3", fullName: "Bui Student Y", email: "student_y@fpt.edu.vn", role: "STUDENT", status: "ACTIVE" },
  { id: "usr_k1l2m3n4", fullName: "Truong Student Z", email: "student_z@fpt.edu.vn", role: "STUDENT", status: "PENDING_APPROVAL" },
  { id: "usr_l2m3n4o5", fullName: "Ly Mentor", email: "mentor3@company.com", role: "MENTOR", status: "UNVERIFIED" },
  { id: "usr_m3n4o5p6", fullName: "Phan Judge", email: "judge3@expert.com", role: "JUDGE", status: "DEACTIVATED" },
  { id: "usr_n4o5p6q7", fullName: "Vuong Coordinator", email: "coord2@event.com", role: "COORDINATOR", status: "ACTIVE" },
  { id: "usr_o5p6q7r8", fullName: "Do Student W", email: "student_w@fpt.edu.vn", role: "STUDENT", status: "ACTIVE" },
];

// Hàm giả lập delay mạng
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// HOOKS
// ==========================================

export function useAdminUsersQuery(params: AdminUserListParams) {
  const { page = 1, pageSize = 10, search, role, status } = params;
  
  return useQuery({
    queryKey: [ADMIN_USERS_KEY, params],
    queryFn: async () => {
      await delay(400); // Fake delay 400ms

      let filtered = [...MOCK_USERS];

      // Xử lý Search
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.fullName.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s) ||
            u.id.toLowerCase().includes(s)
        );
      }

      // Xử lý Filters
      if (role) filtered = filtered.filter((u) => u.role === role);
      if (status) filtered = filtered.filter((u) => u.status === status);

      // Phân trang
      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / pageSize);
      const content = filtered.slice((page - 1) * pageSize, page * pageSize);

      return {
        content,
        totalElements,
        totalPages,
        size: pageSize,
        number: page - 1, // Spring pagination is 0-indexed
      };
    },
    placeholderData: (prev) => prev,
  });
}

export function useAdminUserQuery(userId: string | null) {
  return useQuery({
    queryKey: [ADMIN_USERS_KEY, userId],
    queryFn: async () => {
      await delay(300);
      const user = MOCK_USERS.find((u) => u.id === userId);
      if (!user) throw new Error("User not found");
      return user;
    },
    enabled: Boolean(userId),
  });
}

export function useCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      await delay(600);
      const newUser = {
        id: `usr_${Math.random().toString(36).substring(2, 10)}`, // Generate random ID
        ...payload,
        lastLoginAt: null,
      };
      MOCK_USERS = [newUser, ...MOCK_USERS]; // Thêm lên đầu danh sách
      return newUser;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] }),
  });
}

export function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, payload }: { userId: string; payload: UpdateUserRequest }) => {
      await delay(500);
      MOCK_USERS = MOCK_USERS.map((u) =>
        u.id === userId ? { ...u, ...payload } : u
      );
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] }),
  });
}

export function useDeactivateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await delay(500);
      MOCK_USERS = MOCK_USERS.map((u) =>
        u.id === userId ? { ...u, status: "DEACTIVATED" } : u
      );
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] }),
  });
}

export function useActivateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await delay(500);
      MOCK_USERS = MOCK_USERS.map((u) =>
        u.id === userId ? { ...u, status: "ACTIVE" } : u
      );
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] }),
  });
}