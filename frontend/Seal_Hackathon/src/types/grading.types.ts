import type { ISODateTime, UUID } from "@/types/common.types";
import type { EventCriteriaResponse } from "@/types/criteria.types";
import type { SubmissionLinkResponse } from "@/types/submission.types";

export type AssignedSubmissionResponse = {
  submissionId: UUID;
  teamId: UUID;
  teamName: string;
  roundId: UUID;
  trackId: UUID;
  status: string;
  graded: boolean;
};

export type GradingSubmissionDetailResponse = {
  submissionId: UUID;
  teamName: string;
  projectTitle?: string;
  note?: string;
  links: SubmissionLinkResponse[];
  criteria: EventCriteriaResponse[];
};

export type ScoreItemRequest = {
  eventCriteriaId: UUID;
  value: number;
  comment?: string;
};

export type SaveScoreSheetRequest = {
  scores: ScoreItemRequest[];
  generalComment?: string;
  draft?: boolean;
};

export type ConfirmScoreSheetRequest = {
  confirmationNote?: string;
};

export type UpdateScoreRequest = {
  value: number;
  comment?: string;
};

export type ScoreResponse = {
  id: UUID;
  submissionId: UUID;
  judgeId: UUID;
  eventCriteriaId: UUID;
  value: number;
  comment?: string;
  isDraft: boolean;
  scoredAt?: ISODateTime;
};

export type ScoreSheetResponse = {
  submissionId: UUID;
  judgeId: UUID;
  confirmed: boolean;
  scores: ScoreResponse[];
};

export type GetAssignedSubmissionsParams = {
  status?: string;
  page?: number;
  size?: number;
};
