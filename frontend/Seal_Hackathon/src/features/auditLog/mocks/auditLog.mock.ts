import type { UUID, PageResponse } from "@/types/common.types";
import type { AuditLogResponse, GetAuditLogsParams } from "@/types/system.types";

const mockActions = [
  "EVENT_STATUS_CHANGED", "ROUND_OPENED", "ROUND_CLOSED", "TEAM_CREATED", 
  "TEAM_UPDATED", "SUBMISSION_SUBMITTED", "JUDGE_ASSIGNED", "EMAIL_FAILED",
  "SCORE_CREATE", "SCORE_UPDATE", "SCORE_CONFIRMED", "GRADING_LOCKED",
  "RANKING_RECALCULATED", "ADVANCEMENT_CONFIRMED", "RESULT_PUBLISHED", 
  "TEAM_ADVANCED", "PRIZE_CREATED", "PRIZE_UPDATED", "PRIZE_AWARDED", 
  "PRIZE_AWARD_CLEARED", "TEAM_DISQUALIFIED", "DISQUALIFICATION_OVERTURNED",
  "EXPORT_REQUESTED", "EXPORT_COMPLETED", "EXPORT_FAILED"
];

const mockLogs: AuditLogResponse[] = [
  {
    id: "audit-1" as UUID,
    actorId: "user-1" as UUID,
    actorName: "John Coordinator",
    actionType: "RANKING_RECALCULATED",
    targetTable: "Ranking",
    targetId: "ranking-123" as UUID,
    beforeState: { topScore: 90, lastCalculated: "2026-06-30" },
    afterState: { topScore: 95, lastCalculated: "2026-07-01" },
    context: { eventId: "seal-spring-2026", roundId: "final-round" },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "audit-2" as UUID,
    actorId: "user-2" as UUID,
    actorName: "Admin User",
    actionType: "TEAM_DISQUALIFIED",
    targetTable: "Team",
    targetId: "team-456" as UUID,
    beforeState: { status: "ACTIVE" },
    afterState: { status: "DISQUALIFIED", reason: "Plagiarism detected" },
    context: { teamId: "team-456", eventId: "seal-spring-2026" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "audit-3" as UUID,
    actorName: "System",
    actionType: "PRIZE_AWARDED",
    targetTable: "Award",
    targetId: "award-789" as UUID,
    beforeState: null,
    afterState: { prizeId: "gold-cup", teamId: "team-123", amount: 1000 },
    context: { teamId: "team-123", eventId: "seal-spring-2026" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  }
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAuditLogService = {
  async getCoordinatorAuditLogs(params?: GetAuditLogsParams) {
    return this.getAuditLogs(params);
  },

  async getAdminAuditLogs(params?: GetAuditLogsParams) {
    return this.getAuditLogs(params);
  },

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

  async getAuditActionTypes() {
    await delay(300);
    return mockActions;
  }
};