import type { ISODateTime, UUID } from "@/types/common.types";

export type CreateSubmissionLinkRequest = {
  linkType: string;
  url: string;
  label?: string;
  isPrimary?: boolean;
  displayOrder?: number;
};

export type SubmitDeliverablesRequest = {
  note?: string;
  links: CreateSubmissionLinkRequest[];
};

export type UpdateSubmissionRequest = {
  note?: string;
  status?: string;
};

export type UpdateSubmissionLinkRequest = {
  linkType?: string;
  url?: string;
  label?: string;
  isPrimary?: boolean;
  displayOrder?: number;
};

export type SubmissionResponse = {
  id: UUID;
  teamId: UUID;
  roundId: UUID;
  status: string;
  submissionNumber: number;
  submittedAt?: ISODateTime;
};

export type SubmissionSummaryResponse = {
  id: UUID;
  roundId: UUID;
  roundName: string;
  status: string;
  submissionNumber: number;
  submittedAt?: ISODateTime;
};

export type SubmissionLinkResponse = {
  id: UUID;
  submissionId: UUID;
  linkType: string;
  url: string;
  label?: string;
  isPrimary: boolean;
  displayOrder?: number;
  repoMetadata?: unknown;
};

export type SubmissionDetailResponse = {
  id: UUID;
  teamId: UUID;
  roundId: UUID;
  note?: string;
  status: string;
  submissionNumber: number;
  submittedAt?: ISODateTime;
  links: SubmissionLinkResponse[];
};

export type CriterionAverageScoreResponse = {
  eventCriteriaId: UUID;
  criteriaName: string;
  averageScore: number;
  maxScore: number;
};

export type TeamDetailedScoreResponse = {
  submissionId: UUID;
  teamId: UUID;
  totalScore: number;
  criteriaScores: CriterionAverageScoreResponse[];
};
