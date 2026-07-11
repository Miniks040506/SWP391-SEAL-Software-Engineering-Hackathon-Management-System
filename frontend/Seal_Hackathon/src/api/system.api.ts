import { apiRequest } from "@/api/apiRequest";
import type { PageResponse } from "@/types/common.types";
import type {
  AuditLogResponse,
  GetAuditLogsParams,
  SystemConfigResponse,
  SystemHealthResponse,
  UpdateSystemConfigRequest,
} from "@/types/system.types";

export const systemApi = {
  getSystemConfig(params?: { category?: string; includeSecrets?: boolean }) {
    return apiRequest.get<SystemConfigResponse[]>("/system/config", {params});
  },

  getSystemConfigByKey(key: string, params?: { includeSecrets?: boolean }) {
    return apiRequest.get<SystemConfigResponse>(`/system/config/${encodeURIComponent(key)}`, {params});
  },

  updateSystemConfig(payload: UpdateSystemConfigRequest) {
    return apiRequest.put<SystemConfigResponse[]>("/system/config", payload);
  },

  seedDefaultSystemConfig() {
    return apiRequest.post<void>("/system/config/defaults");
  },

  getSystemHealth() {
    return apiRequest.get<SystemHealthResponse>("/system/health");
  },

  getAuditLogs(params?: GetAuditLogsParams) {
    return apiRequest.get<PageResponse<AuditLogResponse>>(
      "/system/audit-logs",
      {params},
    );
  },

  getAuditLogActions() {
    return apiRequest.get<string[]>("/system/audit-logs/actions");
  },
};
