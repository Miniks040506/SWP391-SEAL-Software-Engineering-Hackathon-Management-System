import { apiRequest } from "@/api/apiRequest";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  CoordinatorSubmissionSummaryResponse,
  CreateSubmissionLinkRequest,
  FileDownloadUrlResponse,
  GetCoordinatorSubmissionsParams,
  SaveSubmissionDraftRequest,
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

  getSubmissionAdminView(submissionId: UUID) {
    return apiRequest.get<SubmissionDetailResponse>(
      `/submissions/${submissionId}/admin-view`,
    );
  },

  getCoordinatorSubmissions(params?: GetCoordinatorSubmissionsParams) {
    return apiRequest.get<PageResponse<CoordinatorSubmissionSummaryResponse>>(
      "/submissions",
      { params },
    );
  },

  getEventSubmissions(eventId: UUID, params?: Omit<GetCoordinatorSubmissionsParams, "eventId">) {
    return apiRequest.get<PageResponse<CoordinatorSubmissionSummaryResponse>>(
      `/events/${eventId}/submissions`,
      { params },
    );
  },

  getRoundSubmissions(roundId: UUID) {
    return apiRequest.get<SubmissionSummaryResponse[]>(
      `/rounds/${roundId}/submissions`,
    );
  },

  // Backend route is planned by the service layer but not currently exposed by the controller.
  getTrackSubmissions(trackId: UUID) {
    return apiRequest.get<SubmissionSummaryResponse[]>(
      `/tracks/${trackId}/submissions`,
    );
  },
};
