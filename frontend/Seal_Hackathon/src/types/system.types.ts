import type { ISODateTime, UUID } from "@/types/common.types";

export type SystemConfigItemRequest = {
  key: string;
  value: unknown;
  encrypted?: boolean;
};

export type UpdateSystemConfigRequest = {
  items: SystemConfigItemRequest[];
};

export type SystemConfigResponse = {
  id: UUID;
  configKey: string;
  configValue: unknown;
  category?: string;
  encrypted: boolean;
  updatedAt: ISODateTime;
};

export type SystemHealthResponse = {
  status: string;
  databaseUp: boolean;
  mailUp: boolean;
  storageUp: boolean;
  details?: Record<string, unknown>;
};

export type AuditLogResponse = {
  id: UUID;
  actorId?: UUID;
  actorName?: string;
  actionType: string;
  targetTable: string;
  targetId?: UUID;
  beforeState?: unknown;
  afterState?: unknown;
  context?: unknown;
  createdAt: ISODateTime;
};

export type JudgeVarianceResponse = {
  judgeId: UUID;
  judgeType?: string;
  meanScore: number;
  variance: number;
  scoreCount: number;
};

export type CriteriaVarianceResponse = {
  eventCriteriaId: UUID;
  criteriaName: string;
  technical: boolean;
  meanScore: number;
  variance: number;
  scoreCount: number;
};

export type VarianceDashboardResponse = {
  eventId: UUID;
  eventName?: string | null;
  roundId?: UUID | null;
  trackId?: UUID | null;
  criteriaType?: string | null;
  judgeType?: string | null;
  scoreCount: number;
  judgeCount: number;
  criteriaCount: number;
  overallMean?: number | null;
  overallVariance?: number | null;
  overallStandardDeviation?: number | null;
  judgeVariances: JudgeVarianceResponse[];
  criteriaVariances: CriteriaVarianceResponse[];
};

export type GetAuditLogsParams = {
  actorId?: UUID;
  actionType?: string;
  targetTable?: string;
  targetId?: UUID;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
};
