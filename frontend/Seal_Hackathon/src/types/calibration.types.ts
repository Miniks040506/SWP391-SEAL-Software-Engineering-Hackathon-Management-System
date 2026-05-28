import type { ISODateTime, UUID } from "@/types/common.types";

export type CreateCalibrationRoundRequest = {
  eventId?: UUID;
  sampleSubmissionId?: UUID;
  benchmarkScores?: unknown;
  description?: string;
  startAt?: ISODateTime;
  endAt?: ISODateTime;
  mandatory?: boolean;
};

export type UpdateCalibrationRoundRequest = {
  benchmarkScores?: unknown;
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
  description?: string;
  startAt?: ISODateTime;
  endAt?: ISODateTime;
  mandatory: boolean;
  distributionPublishedAt?: ISODateTime;
};

export type CalibrationRoundDetailResponse = CalibrationRoundResponse & {
  benchmarkScores?: unknown;
};

export type CalibrationScoreResponse = {
  id: UUID;
  calibrationRoundId: UUID;
  judgeId: UUID;
  eventCriteriaId: UUID;
  value: number;
  deviationFromBenchmark?: number;
};

export type CriterionDistributionResponse = {
  eventCriteriaId: UUID;
  criteriaName: string;
  mean: number;
  min: number;
  max: number;
  standardDeviation: number;
};

export type CalibrationDistributionResponse = {
  calibrationRoundId: UUID;
  distributions: CriterionDistributionResponse[];
};
