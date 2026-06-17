import type { UUID, PageResponse } from "@/types/common.types";
import type { AuditLogResponse, GetAuditLogsParams } from "@/types/system.types";

const mockActions = [
  "EVENT_STATUS_CHANGED", "ROUND_OPENED", "ROUND_CLOSED", "TEAM_CREATED", 
  "TEAM_UPDATED", "SUBMISSION_SUBMITTED", "JUDGE_ASSIGNED", "EMAIL_FAILED"
];

const mockLogs: AuditLogResponse[] = [
  {
    id: "audit-1" as UUID,
    actorId: "user-1" as UUID,
    actorName: "John Coordinator",
    actionType: "EVENT_STATUS_CHANGED",
    targetTable: "HackathonEvent",
    targetId: "event-123" as UUID,
    beforeState: { status: "DRAFT" },
    afterState: { status: "ONGOING" },
    context: { browser: "Chrome", os: "Windows" },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "audit-2" as UUID,
    actorId: "user-2" as UUID,
    actorName: "Alice Leader",
    actionType: "TEAM_UPDATED",
    targetTable: "Team",
    targetId: "team-456" as UUID,
    beforeState: { name: "Code Warriors", description: "Old desc" },
    afterState: { name: "Code Warriors V2", description: "New updated desc" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "audit-3" as UUID,
    actorName: "System",
    actionType: "EMAIL_FAILED",
    targetTable: "EmailLog",
    targetId: "email-789" as UUID,
    beforeState: null,
    afterState: { error: "SMTP Connect Timeout", recipient: "test@example.com" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  }
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAuditLogService = {
  async getAuditLogs(params?: GetAuditLogsParams) {
    await delay(400);

    let filtered = [...mockLogs];

    if (params?.actionType && params.actionType !== "ALL") {
      filtered = filtered.filter(log => log.actionType === params.actionType);
    }

    if (params?.targetTable) {
      const q = params.targetTable.toLowerCase();
      filtered = filtered.filter(log => log.targetTable.toLowerCase().includes(q));
    }

    return {
      content: filtered,
      page: params?.page || 0,
      size: params?.size || 20,
      totalElements: filtered.length,
      totalPages: 1,
    } as PageResponse<AuditLogResponse>;
  },

  async getAuditLogActions() {
    await delay(300);
    return mockActions;
  }
};