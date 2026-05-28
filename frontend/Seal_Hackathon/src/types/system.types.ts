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
  roundId?: UUID;
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
