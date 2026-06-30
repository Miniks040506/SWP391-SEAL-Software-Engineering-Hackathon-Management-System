import { apiRequest } from "@/api/apiRequest";
import type { PageResponse } from "@/types/common.types";
import type { AuditLogResponse, GetAuditLogsParams } from "@/types/system.types";

export const auditApi = {
  getAuditLogs(params?: GetAuditLogsParams) {
    return apiRequest.get<PageResponse<AuditLogResponse>>("/audit-logs", {
      params,
    });
  },

  getCoordinatorAuditLogs(params?: GetAuditLogsParams) {
    return apiRequest.get<PageResponse<AuditLogResponse>>(
      "/coordinator/audit-logs",
      { params },
    );
  },

  getAdminAuditLogs(params?: GetAuditLogsParams) {
    return apiRequest.get<PageResponse<AuditLogResponse>>("/admin/audit-logs", {
      params,
    });
  },

  getAuditActionTypes() {
    return apiRequest.get<string[]>("/audit-logs/actions");
  },
};
