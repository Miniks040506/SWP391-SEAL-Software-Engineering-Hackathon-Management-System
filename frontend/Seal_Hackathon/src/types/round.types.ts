import type { ISODateTime, UUID } from "@/types/common.types";
import type { RankingResponse } from "@/types/ranking.types";

export type CreateRoundRequest = {
  name: string;
  description?: string;
  orderIndex: number;
  isFinal?: boolean;
  startAt?: ISODateTime;
  endAt?: ISODateTime;
  submissionDeadline?: ISODateTime;
  judgingDeadline?: ISODateTime;
};

export type UpdateRoundRequest = {
  name?: string;
  description?: string;
  orderIndex?: number;
  isFinal?: boolean;
  startAt?: ISODateTime;
  endAt?: ISODateTime;
  submissionDeadline?: ISODateTime;
  judgingDeadline?: ISODateTime;
  status?: string;
};

export type AdvancementOverrideRequest = {
  teamId: UUID;
  advanced: boolean;
  reason: string;
};

export type ConfirmAdvancementRequest = {
  /** If omitted, backend uses AdvanceRule suggestions. */
  advancedTeamIds?: UUID[];
  /** Manual advance/eliminate changes. Each override requires a reason. */
  overrides?: AdvancementOverrideRequest[];
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
  trackId: UUID;
  totalToScore?: number;
};

export type RoundResponse = {
  id: UUID;
  eventId: UUID;
  name: string;
  description?: string | null;
  orderIndex: number;
  isFinal: boolean;
  status: string;
  startAt?: ISODateTime;
  endAt?: ISODateTime;
  submissionDeadline?: ISODateTime;
  judgingDeadline?: ISODateTime;
  resultPublishedAt?: ISODateTime | null;
  problemStatementUrl?: string | null;
  problemStatementFileName?: string | null;
  problemStatementUploadedAt?: ISODateTime | null;
};

export type RoundDetailResponse = {
  id: UUID;
  eventId: UUID;
  name: string;
  description?: string | null;
  orderIndex: number;
  isFinal: boolean;
  status: string;
  startAt?: ISODateTime;
  endAt?: ISODateTime;
  submissionDeadline?: ISODateTime;
  judgingDeadline?: ISODateTime;
  submissionLockedAt?: ISODateTime;
  gradingLockedAt?: ISODateTime;
  advancementConfirmedAt?: ISODateTime;
  problemStatementUrl?: string | null;
  problemStatementFileName?: string | null;
  problemStatementUploadedAt?: ISODateTime | null;
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
  startAt?: ISODateTime | null;
  endAt?: ISODateTime | null;
  submissionDeadline?: ISODateTime | null;
  judgingDeadline?: ISODateTime | null;
  submissionLockedAt?: ISODateTime | null;
  gradingLockedAt?: ISODateTime | null;
  canOpen: boolean;
  canClose: boolean;
  canLockSubmissions: boolean;
  deadlineConfigured: boolean;
  criteriaConfigured: boolean;
  judgeAssignmentsConfigured: boolean;
  criteriaCount: number;
  trackCount: number;
  openBlockers: string[];
  submittedOrLateSubmissionCount: number;
  draftSubmissionCount: number;
  judgeAssignmentCount: number;
};

export type JudgeProgressResponse = {
  judgeId: UUID;
  judgeName: string;
  trackId?: UUID | null;
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

export type TeamAdvancementDecisionResponse = {
  teamId: UUID;
  teamName: string;
  trackId?: UUID | null;
  trackName?: string | null;
  rankPosition?: number | null;
  totalScore?: number | null;
  suggestedAdvanced: boolean;
  finalAdvanced: boolean;
  teamStatus?: string | null;
  advanceReason?: string | null;
  overrideReason?: string | null;
};

export type AdvancementPreviewResponse = {
  roundId: UUID;
  advancementConfirmed: boolean;
  suggestedAdvancedTeams: RankingResponse[];
  allRankings: RankingResponse[];
  decisions: TeamAdvancementDecisionResponse[];
  warnings: string[];
};

export type ConfirmAdvancementResponse = {
  roundId: UUID;
  advancedCount: number;
  eliminatedCount: number;
  confirmedAt: ISODateTime;
  decisions: TeamAdvancementDecisionResponse[];
  warnings: string[];
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
