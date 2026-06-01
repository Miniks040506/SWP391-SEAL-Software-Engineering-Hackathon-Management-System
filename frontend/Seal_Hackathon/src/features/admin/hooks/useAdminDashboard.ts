import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/user.api";
import type { AdminUserStats } from "@/types/user.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  actor: string;
  type: "CREATE" | "UPDATE" | "DELETE" | "AUTH" | "SYSTEM";
};

export type PendingRequest = {
  id: string;
  name: string;
  email: string;
  type: "STUDENT_REGISTRATION" | "ROLE_UPGRADE" | "JUDGE_APPROVAL";
  submittedAt: string;
  status: "PENDING";
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    action: "User Login",
    details: "admin@seal.com logged into the system.",
    actor: "System Admin",
    type: "AUTH",
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    action: "System Configuration Updated",
    details: "Updated maximum team size from 4 to 5.",
    actor: "System Admin",
    type: "SYSTEM",
  },
  {
    id: "log-3",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    action: "User Suspended",
    details: "Suspended account judge_temp@example.com due to policy violation.",
    actor: "System Admin",
    type: "UPDATE",
  },
  {
    id: "log-4",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    action: "Event Criteria Created",
    details: "Created new judging criteria for 'Final Round 2026'.",
    actor: "Event Coordinator",
    type: "CREATE",
  },
];

const MOCK_PENDING_USERS: PendingRequest[] = [
  {
    id: "req-1",
    name: "Tran Thi B",
    email: "student_b@fpt.edu.vn",
    type: "STUDENT_REGISTRATION",
    submittedAt: "6/1/2026, 10:57:03 PM",
    status: "PENDING",
  },
  {
    id: "req-2",
    name: "Truong Student Z",
    email: "student_z@fpt.edu.vn",
    type: "STUDENT_REGISTRATION",
    submittedAt: "6/1/2026, 9:27:03 PM",
    status: "PENDING",
  }
];

// ─── Query Hooks ──────────────────────────────────────────────────────────────

const STATS_STALE = 1000 * 60 * 5; // 5 min

function useRoleCount(role: string) {
  return useQuery({
    queryKey: ["admin-dashboard-stat", role],
    queryFn: () => userApi.getUsers({ role, page: 0, size: 1 }),
    staleTime: STATS_STALE,
    select: (d) => d.totalElements ?? 0,
  });
}

export function useAdminDashboard() {
  const adminQ = useRoleCount("ADMIN");
  const studentQ = useRoleCount("STUDENT");
  const mentorQ = useRoleCount("MENTOR");
  const judgeQ = useRoleCount("JUDGE");
  const coordinatorQ = useRoleCount("COORDINATOR");

  const totalQ = useQuery({
    queryKey: ["admin-dashboard-stat", "total"],
    queryFn: () => userApi.getUsers({ page: 0, size: 1 }),
    staleTime: STATS_STALE,
    select: (d) => d.totalElements ?? 0,
  });

  const isLoading =
    adminQ.isLoading ||
    studentQ.isLoading ||
    mentorQ.isLoading ||
    judgeQ.isLoading ||
    coordinatorQ.isLoading ||
    totalQ.isLoading;

  const stats: AdminUserStats = {
    adminCount: adminQ.data ?? 0,
    studentCount: studentQ.data ?? 0,
    mentorCount: mentorQ.data ?? 0,
    judgeCount: judgeQ.data ?? 0,
    coordinatorCount: coordinatorQ.data ?? 0,
    totalCount: totalQ.data ?? 0,
    pendingApprovalCount: 0, // Không dùng trên UI nữa
    suspendedCount: 0,       // Không dùng trên UI nữa
  };

  return {
    isLoading,
    stats,
    auditLogs: MOCK_AUDIT_LOGS,
    pendingRequests: MOCK_PENDING_USERS,
  };
}