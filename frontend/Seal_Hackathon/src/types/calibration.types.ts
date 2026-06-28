import type { ISODateTime, UUID } from "@/types/common.types";
import type { EventCriteriaResponse } from "@/types/criteria.types";
import type { SubmissionLinkResponse } from "@/types/submission.types";

export type CreateCalibrationRoundRequest = {
  eventId?: UUID;
  sampleSubmissionId?: UUID;
  benchmarkScores?: Record<string, number> | unknown;
  description?: string;
  startAt?: ISODateTime;
  endAt?: ISODateTime;
  mandatory?: boolean;
};

export type UpdateCalibrationRoundRequest = {
  sampleSubmissionId?: UUID;
  benchmarkScores?: Record<string, number> | unknown;
  description?: string;
  startAt?: ISODateTime;
  endAt?: ISODateTime;
  mandatory?: boolean;
};

export type CalibrationScoreItemRequest = {
  eventCriteriaId: UUID;
  value: number;
};

export type SubmitCalibrationScoreRequest = {
  scores: CalibrationScoreItemRequest[];
};

export type CalibrationRoundResponse = {
  id: UUID;
  eventId: UUID;
  sampleSubmissionId: UUID;
  description?: string | null;
  startAt?: ISODateTime | null;
  endAt?: ISODateTime | null;
  mandatory: boolean;
  assignedJudgeCount: number;
  submittedJudgeCount: number;
  pendingJudgeCount: number;
  distributionPublishedAt?: ISODateTime | null;
  submittedByCurrentJudge?: boolean | null;
};

export type CalibrationRoundDetailResponse = Omit<
  CalibrationRoundResponse,
  "assignedJudgeCount" | "submittedJudgeCount" | "pendingJudgeCount"
> & {
  sampleRoundId: UUID;
  benchmarkScores?: Record<string, number> | unknown;
};

export type CalibrationScoreResponse = {
  id: UUID;
  calibrationRoundId: UUID;
  judgeId: UUID;
  eventCriteriaId: UUID;
  value: number;
  deviationFromBenchmark?: number | null;
};

export type CalibrationScoreSheetResponse = {
  calibrationRoundId: UUID;
  eventId: UUID;
  sampleSubmissionId: UUID;
  sampleTeamName?: string | null;
  sampleProjectTitle?: string | null;
  sampleNote?: string | null;
  startAt?: ISODateTime | null;
  endAt?: ISODateTime | null;
  mandatory: boolean;
  distributionPublished: boolean;
  distributionPublishedAt?: ISODateTime | null;
  canSubmit: boolean;
  submitted: boolean;
  serverTime: ISODateTime;
  links: SubmissionLinkResponse[];
  criteria: EventCriteriaResponse[];
  scores: CalibrationScoreResponse[];
};

export type CriterionDistributionResponse = {
  eventCriteriaId: UUID;
  criteriaName: string;
  category?: string | null;
  technical?: boolean | null;
  benchmarkScore?: number | null;
  judgeCount: number;
  mean?: number | null;
  min?: number | null;
  max?: number | null;
  standardDeviation?: number | null;
};

export type CalibrationDistributionResponse = {
  calibrationRoundId: UUID;
  published: boolean;
  distributionPublishedAt?: ISODateTime | null;
  totalScoreRows: number;
  distributions: CriterionDistributionResponse[];
};
