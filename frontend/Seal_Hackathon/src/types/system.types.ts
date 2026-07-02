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
  hashedJudgeId: string;
  judgeType?: string;
  meanScore: number;
  variance: number;
  standardDeviation: number;
  minScore: number;
  maxScore: number;
  scoreCount: number;
  highVariance: boolean;
};

export type CriteriaVarianceResponse = {
  eventCriteriaId: UUID;
  criteriaName: string;
  category?: string | null;
  technical: boolean;
  meanScore: number;
  variance: number;
  standardDeviation: number;
  minScore: number;
  maxScore: number;
  scoreCount: number;
  judgeCount: number;
  highVariance: boolean;
};

export type VarianceDashboardResponse = {
  eventId: UUID;
  eventName: string;
  roundId?: UUID | null;
  trackId?: UUID | null;
  criteriaType?: string | null;
  judgeType?: string | null;
  totalScoreCount: number;
  totalJudgeCount: number;
  totalCriteriaCount: number;
  overallMean: number;
  overallVariance: number;
  overallStandardDeviation: number;
  averageCriterionVariance: number;
  averageJudgeVariance: number;
  judgeVariances: JudgeVarianceResponse[];
  criteriaVariances: CriteriaVarianceResponse[];
};

export type GetAuditLogsParams = {
  actorId?: UUID;
  actionType?: string;
  targetTable?: string;
  targetId?: UUID;
  eventId?: UUID;
  teamId?: UUID;
  submissionId?: UUID;
  from?: string;
  to?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
};
