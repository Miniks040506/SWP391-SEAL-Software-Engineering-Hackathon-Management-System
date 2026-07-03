import { apiRequest } from "@/api/apiRequest";
import type {
  JudgeSubmissionAssignmentResponse,
  JudgeSubmissionQueueSummaryResponse,
} from "@/types/grading.types";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  GetJudgeSubmissionsParams,
  JudgeAssignmentListItem,
  JudgeSubmissionDetailResponse,
} from "@/types/judge.types";

type JudgeSubmissionApiParams = Omit<GetJudgeSubmissionsParams, "search">;

export const judgeApi = {
  getMyAssignments() {
    return apiRequest.get<JudgeAssignmentListItem[]>("/judge/assignments");
  },

  getMySubmissions(params?: JudgeSubmissionApiParams) {
    return apiRequest.get<PageResponse<JudgeSubmissionAssignmentResponse>>(
      "/judge/submissions",
      { params },
    );
  },

  getMyRoundSubmissions(
    roundId: UUID,
    params?: Omit<JudgeSubmissionApiParams, "roundId">,
  ) {
    return apiRequest.get<PageResponse<JudgeSubmissionAssignmentResponse>>(
      `/judge/rounds/${roundId}/submissions`,
      { params },
    );
  },

  getMySubmissionSummary(roundId?: UUID) {
    const url = roundId
      ? `/judge/rounds/${roundId}/submissions/summary`
      : "/judge/submissions/summary";
    return apiRequest.get<JudgeSubmissionQueueSummaryResponse>(url);
  },

  getMySubmissionDetail(submissionId: UUID) {
    return apiRequest.get<JudgeSubmissionDetailResponse>(
      `/judge/submissions/${submissionId}`,
    );
  },
};
