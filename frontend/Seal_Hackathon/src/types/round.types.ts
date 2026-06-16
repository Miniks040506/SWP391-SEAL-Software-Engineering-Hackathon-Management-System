import type { ISODateTime, UUID } from "@/types/common.types";
import type { RankingResponse } from "@/types/ranking.types";

export type CreateRoundRequest = {
  name: string;
  orderIndex: number;
  isFinal?: boolean;
  submissionDeadline?: ISODateTime;
  judgingDeadline?: ISODateTime;
};

export type UpdateRoundRequest = {
  name?: string;
  orderIndex?: number;
  isFinal?: boolean;
  submissionDeadline?: ISODateTime;
  judgingDeadline?: ISODateTime;
  status?: string;
};

export type ConfirmAdvancementRequest = {
  advancedTeamIds: UUID[];
  note?: string;
};

export type AdvanceRuleType =
  | "TOP_N"
  | "TOP_PERCENT"
  | "MIN_SCORE"
  | "WILDCARD"
  | string;

export type CreateAdvanceRuleRequest = {
  ruleType: AdvanceRuleType;
  trackId?: UUID | null;
  topN?: number;
  minScore?: number;
  topPercent?: number;
  wildCardSlots?: number;
  priority?: number;
  description?: string;
};

export type UpdateAdvanceRuleRequest = {
  ruleType?: AdvanceRuleType;
  trackId?: UUID | null;
  global?: boolean;
  topN?: number;
  minScore?: number;
  topPercent?: number;
  wildCardSlots?: number;
  priority?: number;
  description?: string;
  active?: boolean;
};

export type AssignJudgeRequest = {
  judgeId: UUID;
  trackId?: UUID | null;
  totalToScore?: number;
};

export type RoundResponse = {
  id: UUID;
  eventId: UUID;
  name: string;
  orderIndex: number;
  isFinal: boolean;
  status: string;
  submissionDeadline?: ISODateTime;
  judgingDeadline?: ISODateTime;
};

export type RoundDetailResponse = {
  id: UUID;
  eventId: UUID;
  name: string;
  orderIndex: number;
  isFinal: boolean;
  status: string;
  submissionDeadline?: ISODateTime;
  judgingDeadline?: ISODateTime;
  submissionLockedAt?: ISODateTime;
  gradingLockedAt?: ISODateTime;
  advancementConfirmedAt?: ISODateTime;
};

export type RoundLockResponse = {
  roundId: UUID;
  lockType: string;
  lockedAt: ISODateTime;
  message: string;
};

export type RoundOperationStatusResponse = {
  roundId: UUID;
  eventId: UUID;
  eventStatus: string;
  roundStatus: string;
  submissionDeadline?: ISODateTime | null;
  judgingDeadline?: ISODateTime | null;
  submissionLockedAt?: ISODateTime | null;
  gradingLockedAt?: ISODateTime | null;
  canOpen: boolean;
  canClose: boolean;
  canLockSubmissions: boolean;
  submittedOrLateSubmissionCount: number;
  draftSubmissionCount: number;
  judgeAssignmentCount: number;
};

export type JudgeProgressResponse = {
  judgeId: UUID;
  judgeName: string;
  trackId?: UUID;
  completed: number;
  total: number;
};

export type ScoringProgressResponse = {
  roundId: UUID;
  completed: number;
  total: number;
  percent: number;
  judges: JudgeProgressResponse[];
};

export type AdvancementPreviewResponse = {
  roundId: UUID;
  suggestedAdvancedTeams: RankingResponse[];
  warnings: string[];
};

export type ConfirmAdvancementResponse = {
  roundId: UUID;
  advancedCount: number;
  confirmedAt: ISODateTime;
};

export type AdvanceRuleResponse = {
  id: UUID;
  roundId: UUID;
  trackId?: UUID | null;
  ruleType: AdvanceRuleType;
  topN?: number | null;
  minScore?: number | null;
  topPercent?: number | null;
  wildCardSlots?: number | null;
  active: boolean;
  value: number;
  priority: number;
  description?: string | null;
};

export type JudgeAssignmentResponse = {
  id: UUID;
  roundId: UUID;
  judgeId: UUID;
  judgeName: string;
  trackId?: UUID | null;
  scoringProgress: number;
  totalToScore?: number | null;
};
