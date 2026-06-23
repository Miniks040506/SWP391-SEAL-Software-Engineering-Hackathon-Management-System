import { apiRequest } from "@/api/apiRequest";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  AssignedSubmissionResponse,
  ConfirmScoreSheetRequest,
  GetAssignedSubmissionsParams,
  GradingSubmissionDetailResponse,
  SaveScoreSheetRequest,
  ScoreResponse,
  ScoreSheetResponse,
  UpdateScoreRequest,
} from "@/types/grading.types";

export const gradingApi = {
  getAssignedSubmissions(roundId: UUID, params?: GetAssignedSubmissionsParams) {
    return apiRequest.get<PageResponse<AssignedSubmissionResponse>>(
      `/grading/rounds/${roundId}/assigned-submissions`,
      {params},
    );
  },

  getSubmissionForGrading(submissionId: UUID) {
    return apiRequest.get<GradingSubmissionDetailResponse>(
      `/grading/submissions/${submissionId}`,
    );
  },

  getScoreSheet(submissionId: UUID) {
    return apiRequest.get<ScoreSheetResponse>(
      `/grading/submissions/${submissionId}/score-sheet`,
    );
  },

  getMyScoresForSubmission(submissionId: UUID) {
    return apiRequest.get<ScoreSheetResponse>(
      `/grading/submissions/${submissionId}/scores`,
    );
  },

  saveDraftScores(submissionId: UUID, payload: SaveScoreSheetRequest) {
    return apiRequest.post<ScoreSheetResponse>(
      `/grading/submissions/${submissionId}/scores/draft`,
      {...payload, draft: true},
    );
  },

  submitFinalScores(submissionId: UUID, payload: SaveScoreSheetRequest) {
    return apiRequest.post<ScoreSheetResponse>(
      `/grading/submissions/${submissionId}/scores/submit`,
      {...payload, draft: false},
    );
  },

  saveScores(submissionId: UUID, payload: SaveScoreSheetRequest) {
    return apiRequest.post<ScoreSheetResponse>(
      `/grading/submissions/${submissionId}/scores`,
      payload,
    );
  },

  confirmScores(submissionId: UUID, payload: ConfirmScoreSheetRequest = {}) {
    return apiRequest.post<ScoreSheetResponse>(
      `/grading/submissions/${submissionId}/scores/confirm`,
      payload,
    );
  },

  updateScore(scoreId: UUID, payload: UpdateScoreRequest) {
    return apiRequest.patch<ScoreResponse>(`/grading/scores/${scoreId}`, payload);
  },

  confirmScore(scoreId: UUID) {
    return apiRequest.post<ScoreResponse>(`/grading/scores/${scoreId}/confirm`);
  },
};
