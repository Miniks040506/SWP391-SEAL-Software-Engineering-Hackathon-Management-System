import { useQuery } from "@tanstack/react-query";
import { systemApi } from "@/api/system.api";
import { mockAuditLogService } from "../mocks/auditLog.mock";
import type { GetAuditLogsParams } from "@/types/system.types";

const USE_MOCK = true;
const activeApi = USE_MOCK ? (mockAuditLogService as any) : systemApi;

export const auditKeys = {
  all: ["audit-logs"] as const,
  list: (params?: GetAuditLogsParams) => [...auditKeys.all, "list", params] as const,
  actions: () => [...auditKeys.all, "actions"] as const,
};

export function useAuditLogsQuery(params?: GetAuditLogsParams) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => activeApi.getAuditLogs(params),
  });
}

export function useAuditLogActionsQuery() {
  return useQuery({
    queryKey: auditKeys.actions(),
    queryFn: () => activeApi.getAuditLogActions(),
  });
}