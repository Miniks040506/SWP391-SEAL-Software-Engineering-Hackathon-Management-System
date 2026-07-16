import { apiRequest } from "@/api/apiRequest";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  CoordinatorSubmissionSummaryResponse,
  CreateSubmissionLinkRequest,
  FileDownloadUrlResponse,
  GetEventSubmissionsParams,
  SaveSubmissionDraftRequest,
  SubmissionAttemptResponse,
  SubmissionDetailResponse,
  SubmissionLinkResponse,
  SubmissionRequirementsResponse,
  SubmissionResponse,
  SubmissionSummaryResponse,
  SubmitDeliverablesRequest,
  TeamDetailedScoreResponse,
  UpdateSubmissionLinkRequest,
  UpdateSubmissionLinkMetadataRequest,
  UpdateSubmissionRequest,
} from "@/types/submission.types";

export const submissionApi = {
  getSubmissionRequirements(teamId: UUID, roundId: UUID) {
    return apiRequest.get<SubmissionRequirementsResponse>(
      `/teams/${teamId}/rounds/${roundId}/submission-requirements`,
    );
  },

  saveSubmissionDraft(teamId: UUID, roundId: UUID, payload: SaveSubmissionDraftRequest) {
    return apiRequest.post<SubmissionResponse>(
      `/teams/${teamId}/rounds/${roundId}/submission/draft`,
      payload,
    );
  },

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

  getSubmissionAttempts(submissionId: UUID) {
    return apiRequest.get<SubmissionAttemptResponse[]>(
      `/submissions/${submissionId}/attempts`,
    );
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

  submitExistingSubmission(submissionId: UUID) {
    return apiRequest.post<SubmissionResponse>(`/submissions/${submissionId}/submit`);
  },

  beginSubmissionResubmission(submissionId: UUID) {
    return apiRequest.post<SubmissionResponse>(`/submissions/${submissionId}/resubmit`);
  },

  addSubmissionLink(submissionId: UUID, payload: CreateSubmissionLinkRequest) {
    return apiRequest.post<SubmissionResponse>(
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

  updateSubmissionLinkMetadata(
    linkId: UUID,
    payload: UpdateSubmissionLinkMetadataRequest,
  ) {
    return apiRequest.patch<SubmissionLinkResponse>(
      `/submission-links/${linkId}/metadata`,
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

  createSubmissionAttemptFileDownloadUrl(submissionId: UUID, evidenceId: UUID) {
    return apiRequest.get<FileDownloadUrlResponse>(
      `/submissions/${submissionId}/attempts/evidence/${evidenceId}/download-url`,
    );
  },

  getSubmissionAdminView(submissionId: UUID) {
    return apiRequest.get<SubmissionDetailResponse>(
      `/submissions/${submissionId}/admin-view`,
    );
  },

  getEventSubmissions(params?: GetEventSubmissionsParams) {
    return apiRequest.get<PageResponse<CoordinatorSubmissionSummaryResponse>>(
      "/submissions",
      { params },
    );
  },

  getRoundSubmissions(roundId: UUID) {
    return apiRequest.get<SubmissionSummaryResponse[]>(
      `/rounds/${roundId}/submissions`,
    );
  },

  getTrackSubmissions(trackId: UUID) {
    return apiRequest.get<SubmissionSummaryResponse[]>(
      `/tracks/${trackId}/submissions`,
    );
  },
};
