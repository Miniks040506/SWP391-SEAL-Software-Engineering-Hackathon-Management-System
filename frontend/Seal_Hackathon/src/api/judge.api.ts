import { apiRequest } from "@/api/apiRequest";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  GetJudgeSubmissionsParams,
  JudgeAssignmentListItem,
  JudgeSubmissionAssignmentResponse,
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

  getMySubmissionDetail(submissionId: UUID) {
    return apiRequest.get<JudgeSubmissionDetailResponse>(
      `/judge/submissions/${submissionId}`,
    );
  },
};
