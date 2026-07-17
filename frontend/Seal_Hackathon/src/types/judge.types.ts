import type { PageParams, UUID } from "@/types/common.types";
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

export type JudgeEligibleSubmissionStatus = "SUBMITTED" | "LATE";

export type GetJudgeSubmissionsParams = PageParams & {
  roundId?: UUID;
  status?: JudgeEligibleSubmissionStatus;
  search?: string;
};

export type JudgeSubmissionDetailResponse = GradingSubmissionDetailResponse;
