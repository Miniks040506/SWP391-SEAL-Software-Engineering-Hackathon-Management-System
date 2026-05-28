import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  CreateSubmissionLinkRequest,
  SubmissionDetailResponse,
  SubmissionLinkResponse,
  SubmissionResponse,
  SubmissionSummaryResponse,
  SubmitDeliverablesRequest,
  TeamDetailedScoreResponse,
  UpdateSubmissionLinkRequest,
  UpdateSubmissionRequest,
} from "@/types/submission.types";

export const submissionApi = {
  submitDeliverables(teamId: UUID, roundId: UUID, payload: SubmitDeliverablesRequest) {
    return apiRequest.post<SubmissionResponse>(
      `/teams/${teamId}/rounds/${roundId}/submission`,
      payload,
    );
  },

  getTeamSubmissions(teamId: UUID) {
    return apiRequest.get<SubmissionSummaryResponse[]>(
      `/teams/${teamId}/submissions`,
    );
  },

  getSubmissionById(submissionId: UUID) {
    return apiRequest.get<SubmissionDetailResponse>(`/submissions/${submissionId}`);
  },

  updateSubmission(submissionId: UUID, payload: UpdateSubmissionRequest) {
    return apiRequest.patch<SubmissionResponse>(
      `/submissions/${submissionId}`,
      payload,
    );
  },

  addSubmissionLink(submissionId: UUID, payload: CreateSubmissionLinkRequest) {
    return apiRequest.post<SubmissionLinkResponse>(
      `/submissions/${submissionId}/links`,
      payload,
    );
  },

  updateSubmissionLink(linkId: UUID, payload: UpdateSubmissionLinkRequest) {
    return apiRequest.patch<SubmissionLinkResponse>(
      `/submission-links/${linkId}`,
      payload,
    );
  },

  deleteSubmissionLink(linkId: UUID) {
    return apiRequest.delete<void>(`/submission-links/${linkId}`);
  },

  getMyTeamDetailedScores(submissionId: UUID) {
    return apiRequest.get<TeamDetailedScoreResponse>(
      `/submissions/${submissionId}/scores/me`,
    );
  },
};
