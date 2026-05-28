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
  getSystemConfig(params?: { category?: string }) {
    return apiRequest.get<SystemConfigResponse[]>("/system/config", {params});
  },

  updateSystemConfig(payload: UpdateSystemConfigRequest) {
    return apiRequest.put<SystemConfigResponse[]>("/system/config", payload);
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
};
