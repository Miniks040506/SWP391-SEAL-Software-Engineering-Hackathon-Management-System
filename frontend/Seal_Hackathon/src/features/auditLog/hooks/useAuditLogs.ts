import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/api/audit.api";
import { mockAuditLogService } from "../mocks/auditLog.mock";
import type { GetAuditLogsParams } from "@/types/system.types";

const USE_MOCK = false;
const activeApi = USE_MOCK ? (mockAuditLogService as any) : auditApi;

export const auditKeys = {
  all: ["audit-logs"] as const,
  list: (role: "admin" | "coordinator", params?: GetAuditLogsParams) => [...auditKeys.all, "list", role, params] as const,
  actions: () => [...auditKeys.all, "actions"] as const,
};

export function useCoordinatorAuditLogsQuery(params?: GetAuditLogsParams) {
  return useQuery({
    queryKey: auditKeys.list("coordinator", params),
    queryFn: () => activeApi.getCoordinatorAuditLogs(params),
  });
}

export function useAdminAuditLogsQuery(params?: GetAuditLogsParams) {
  return useQuery({
    queryKey: auditKeys.list("admin", params),
    queryFn: () => activeApi.getAdminAuditLogs(params),
  });
}

export function useAuditLogActionsQuery() {
  return useQuery({
    queryKey: auditKeys.actions(),
    queryFn: () => activeApi.getAuditActionTypes(),
  });
}