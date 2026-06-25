import type { ISODateTime, UUID } from "@/types/common.types";
import type { EventCriteriaResponse } from "@/types/criteria.types";
import type { SubmissionLinkResponse } from "@/types/submission.types";

export type JudgeGradingStatus =
  | "PENDING"
  | "DRAFT_SAVED"
  | "SUBMITTED"
  | "LOCKED"
  | string;

export type AssignedSubmissionResponse = {
  submissionId: UUID;
  teamId: UUID;
  teamName: string;
  roundId: UUID;
  trackId: UUID;
  status: string;
  graded: boolean;
  gradingStatus: JudgeGradingStatus;
  draftScoreCount: number;
  confirmedScoreCount: number;
  criteriaCount: number;
  gradingLocked: boolean;
  gradingLockedAt?: ISODateTime | null;
};

export type JudgeSubmissionAssignmentResponse = {
  submissionId: UUID;
  teamId: UUID;
  teamName: string;
  projectTitle?: string | null;
  trackId?: UUID | null;
  trackName?: string | null;
  roundId: UUID;
  roundName: string;
  submissionStatus: string;
  submissionNumber?: number | null;
  submittedAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
  roundSubmissionLocked: boolean;
  roundSubmissionLockedAt?: ISODateTime | null;
  confirmedScoreCount: number;
  criteriaCount: number;
  draftScoreCount: number;
  gradingLocked: boolean;
  gradingLockedAt?: ISODateTime | null;
  gradingStatus: JudgeGradingStatus;
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
  comment?: string | null;
  isDraft: boolean;
  scoredAt?: ISODateTime | null;
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

export type SubmissionGradingProgressResponse = {
  submissionId: UUID;
  teamId?: UUID | null;
  teamName?: string | null;
  trackId?: UUID | null;
  trackName?: string | null;
  roundId?: UUID | null;
  roundName?: string | null;
  submissionStatus?: string | null;
  gradingStatus: JudgeGradingStatus;
  draftScoreCount: number;
  confirmedScoreCount: number;
  criteriaCount: number;
  completed: boolean;
  gradingLocked: boolean;
  gradingLockedAt?: ISODateTime | null;
};

export type JudgeAssignmentProgressResponse = {
  assignmentId: UUID;
  judgeId: UUID;
  judgeName?: string | null;
  judgeEmail?: string | null;
  judgeType?: string | null;
  trackId?: UUID | null;
  trackName?: string | null;
  totalAssignedSubmissions: number;
  completedAssignedSubmissions: number;
  pendingSubmissions: number;
  draftSavedSubmissions: number;
  submittedSubmissions: number;
  lockedSubmissions: number;
  criteriaCount: number;
  draftScoreCount: number;
  confirmedScoreCount: number;
  expectedFinalScoreCount: number;
  percent: number;
  submissions: SubmissionGradingProgressResponse[];
};

export type RoundGradingProgressResponse = {
  roundId: UUID;
  eventId: UUID;
  roundName: string;
  roundStatus: string;
  submissionLockedAt?: ISODateTime | null;
  gradingLockedAt?: ISODateTime | null;
  submissionLocked: boolean;
  gradingLocked: boolean;
  canLockGrading: boolean;
  lockWarning?: string | null;
  judgeAssignmentCount: number;
  totalAssignedSubmissions: number;
  completedAssignedSubmissions: number;
  pendingSubmissions: number;
  draftSavedSubmissions: number;
  submittedSubmissions: number;
  lockedSubmissions: number;
  criteriaCount: number;
  draftScoreCount: number;
  confirmedScoreCount: number;
  expectedFinalScoreCount: number;
  percent: number;
  judgeAssignments: JudgeAssignmentProgressResponse[];
};

export type EventGradingProgressResponse = {
  eventId: UUID;
  eventName: string;
  eventStatus: string;
  roundCount: number;
  totalAssignedSubmissions: number;
  completedAssignedSubmissions: number;
  pendingSubmissions: number;
  draftSavedSubmissions: number;
  submittedSubmissions: number;
  lockedSubmissions: number;
  expectedFinalScoreCount: number;
  confirmedScoreCount: number;
  percent: number;
  rounds: RoundGradingProgressResponse[];
};
