import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/user.api";
import { systemApi } from "@/api/system.api";
import { mockAdminDashboardApi } from "../mocks/adminDashboard.mock";
import type { AuditLogResponse } from "@/types/system.types";
import type { AdminUserStats, AuditLogEntry, PendingRequest, UserApprovalResponse } from "@/types/user.types";

const USE_MOCK = false;
const activeApi = USE_MOCK ? mockAdminDashboardApi : {
  getUsers: userApi.getUsers,
  getPendingApprovalUsers: userApi.getPendingApprovalUsers,
  getAuditLogs: systemApi.getAuditLogs,
};

const DASHBOARD_STATS_KEY = "admin-dashboard-stat";
const DASHBOARD_PENDING_KEY = "admin-dashboard-pending-users";
const DASHBOARD_AUDIT_KEY = "admin-dashboard-audit-logs";

const STATS_STALE = 1000 * 60 * 5;
const LOGS_STALE = 1000 * 60 * 2;  

function toEntryType(actionType: string): AuditLogEntry["type"] {
  const t = actionType.toUpperCase();
  if (t.includes("LOGIN") || t.includes("AUTH") || t.includes("PASSWORD")) return "AUTH";
  if (t.includes("CREATE") || t.includes("INSERT")) return "CREATE";
  if (t.includes("DELETE") || t.includes("REMOVE")) return "DELETE";
  if (t.includes("UPDATE") || t.includes("PATCH") || t.includes("SUSPEND") || t.includes("ACTIVATE")) return "UPDATE";
  return "SYSTEM";
}

function toAuditLogEntry(log: AuditLogResponse): AuditLogEntry {
  const after = log.afterState as Record<string, unknown> | null;
  const details =
    after && typeof after === "object"
      ? Object.entries(after).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(", ")
      : `${log.targetTable ?? "Record"} ${log.targetId ? `(${String(log.targetId).slice(0, 8)})` : ""} affected.`;
  return {
    id: String(log.id),
    timestamp: log.createdAt,
    action: log.actionType,
    details,
    actor: log.actorName ?? "System",
    type: toEntryType(log.actionType),
  };
}

function useRoleCount(role: string) {
  return useQuery({
    queryKey: [DASHBOARD_STATS_KEY, role],
    queryFn: () => activeApi.getUsers({ role, page: 0, size: 1 }),
    staleTime: STATS_STALE,
    select: (d: any) => d.totalElements ?? 0,
  });
}

function useStatusCount(status: string) {
  return useQuery({
    queryKey: [DASHBOARD_STATS_KEY, status],
    queryFn: () => activeApi.getUsers({ status, page: 0, size: 1 }),
    staleTime: STATS_STALE,
    select: (d: any) => d.totalElements ?? 0,
  });
}

export function useAdminDashboard() {
  const adminQ = useRoleCount("ADMIN");
  const studentQ = useRoleCount("STUDENT");
  const mentorQ = useRoleCount("MENTOR");
  const judgeQ = useRoleCount("JUDGE");
  const coordinatorQ = useRoleCount("COORDINATOR");

  const totalQ = useQuery({
    queryKey: [DASHBOARD_STATS_KEY, "total"],
    queryFn: () => activeApi.getUsers({ page: 0, size: 1 }),
    staleTime: STATS_STALE,
    select: (d: any) => d.totalElements ?? 0,
  });

  const pendingCountQ = useStatusCount("PENDING_APPROVAL");
  const suspendedCountQ = useStatusCount("SUSPENDED");

  const pendingUsersQ = useQuery({
    queryKey: [DASHBOARD_PENDING_KEY],
    queryFn: () => activeApi.getPendingApprovalUsers({ page: 0, size: 5 }),
    staleTime: STATS_STALE,
    select: (d: any): PendingRequest[] =>
      (d.content ?? []).map((u: UserApprovalResponse) => ({
        id: String(u.id),
        name: u.fullName,
        email: u.email,
        type: "STUDENT_REGISTRATION" as const,
        submittedAt: u.emailVerifiedAt ? new Date(u.emailVerifiedAt).toLocaleString() : "—",
        status: "PENDING" as const,
      })),
  });

  const auditLogsQ = useQuery({
    queryKey: [DASHBOARD_AUDIT_KEY],
    queryFn: () => activeApi.getAuditLogs({ page: 0, size: 4 }),
    staleTime: LOGS_STALE,
    select: (d: any): AuditLogEntry[] => (d.content ?? []).map(toAuditLogEntry),
  });

  const isStatsLoading =
    adminQ.isLoading || studentQ.isLoading || mentorQ.isLoading ||
    judgeQ.isLoading || coordinatorQ.isLoading || totalQ.isLoading ||
    pendingCountQ.isLoading || suspendedCountQ.isLoading;

  const isPendingLoading = pendingUsersQ.isLoading;
  const isAuditLoading = auditLogsQ.isLoading;

  const stats: AdminUserStats = {
    adminCount: adminQ.data ?? 0,
    studentCount: studentQ.data ?? 0,
    mentorCount: mentorQ.data ?? 0,
    judgeCount: judgeQ.data ?? 0,
    coordinatorCount: coordinatorQ.data ?? 0,
    totalCount: totalQ.data ?? 0,
    pendingApprovalCount: pendingCountQ.data ?? 0,
    suspendedCount: suspendedCountQ.data ?? 0,
  };

  return {
    isLoading: isStatsLoading || isPendingLoading || isAuditLoading,
    isStatsLoading,
    isPendingLoading,
    isAuditLoading,
    stats,
    auditLogs: auditLogsQ.data ?? [],
    pendingRequests: pendingUsersQ.data ?? [],
  };
}