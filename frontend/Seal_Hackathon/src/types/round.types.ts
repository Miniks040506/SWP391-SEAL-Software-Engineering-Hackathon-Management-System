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

export type CreateAdvanceRuleRequest = {
  ruleType: string;
  trackId?: UUID;
  topN?: number;
  minScore?: number;
  topPercent?: number;
  description?: string;
};

export type UpdateAdvanceRuleRequest = {
  topN?: number;
  minScore?: number;
  topPercent?: number;
  description?: string;
  active?: boolean;
};

export type AssignJudgeRequest = {
  judgeId: UUID;
  trackId: UUID;
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
  trackId?: UUID;
  ruleType: string;
  topN?: number;
  minScore?: number;
  topPercent?: number;
  active: boolean;
};

export type JudgeAssignmentResponse = {
  id: UUID;
  roundId: UUID;
  judgeId: UUID;
  judgeName: string;
  trackId?: UUID;
  scoringProgress: number;
  totalToScore?: number;
};
