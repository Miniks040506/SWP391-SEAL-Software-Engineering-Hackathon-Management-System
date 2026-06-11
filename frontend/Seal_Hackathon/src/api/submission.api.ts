import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  CreateSubmissionLinkRequest,
  FileDownloadUrlResponse,
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

  uploadSubmissionFile(teamId: UUID, roundId: UUID, formData: FormData) {
    return apiRequest.postForm<SubmissionResponse>(
      `/teams/${teamId}/rounds/${roundId}/submission/file`,
      formData,
    );
  },

  uploadFileToSubmission(submissionId: UUID, formData: FormData) {
    return apiRequest.postForm<SubmissionResponse>(
      `/submissions/${submissionId}/files`,
      formData,
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

  getMentorTeamSubmissions(teamId: UUID) {
    return apiRequest.get<SubmissionSummaryResponse[]>(
      `/mentor/teams/${teamId}/submissions`,
    );
  },

  getMentorSubmissionById(submissionId: UUID) {
    return apiRequest.get<SubmissionDetailResponse>(
      `/mentor/submissions/${submissionId}`,
    );
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

  createSubmissionFileDownloadUrl(linkId: UUID) {
    return apiRequest.get<FileDownloadUrlResponse>(
      `/submission-links/${linkId}/download-url`,
    );
  },

  getMyTeamDetailedScores(submissionId: UUID) {
    return apiRequest.get<TeamDetailedScoreResponse>(
      `/submissions/${submissionId}/scores/me`,
    );
  },
};
