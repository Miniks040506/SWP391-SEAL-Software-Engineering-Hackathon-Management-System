import type { ISODateTime, PageParams, UUID } from "@/types/common.types";
import type { GradingSubmissionDetailResponse } from "@/types/grading.types";

export type JudgeAssignmentListItem = {
  id: UUID;
  roundId: UUID;
  judgeId: UUID;
  judgeName: string;
  trackId?: UUID | null;
  scoringProgress: number;
  totalToScore?: number | null;
};

export type JudgeSubmissionAssignmentResponse = {
  submissionId: UUID;
  teamId?: UUID | null;
  teamName?: string | null;
  projectTitle?: string | null;
  trackId?: UUID | null;
  trackName?: string | null;
  roundId?: UUID | null;
  roundName?: string | null;
  submissionStatus?: string | null;
  submissionNumber?: number | null;
  submittedAt?: ISODateTime | null;
  updatedAt?: ISODateTime | null;
  roundSubmissionLocked: boolean;
  roundSubmissionLockedAt?: ISODateTime | null;
  confirmedScoreCount: number;
  criteriaCount: number;
  gradingStatus: "PENDING" | "READY" | "GRADED" | string;
};

export type GetJudgeSubmissionsParams = PageParams & {
  roundId?: UUID;
  status?: string;
};

export type JudgeSubmissionDetailResponse = GradingSubmissionDetailResponse;
