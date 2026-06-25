import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  AdvanceRuleResponse,
  AdvancementPreviewResponse,
  AssignJudgeRequest,
  ConfirmAdvancementRequest,
  ConfirmAdvancementResponse,
  CreateAdvanceRuleRequest,
  CreateRoundRequest,
  JudgeAssignmentResponse,
  RoundDetailResponse,
  RoundLockResponse,
  RoundOperationStatusResponse,
  RoundResponse,
  ScoringProgressResponse,
  UpdateAdvanceRuleRequest,
  UpdateRoundRequest,
} from "@/types/round.types";

export const roundApi = {
  createRound(eventId: UUID, payload: CreateRoundRequest) {
    return apiRequest.post<RoundResponse>(`/events/${eventId}/rounds`, payload);
  },

  getRoundsByEvent(eventId: UUID) {
    return apiRequest.get<RoundResponse[]>(`/events/${eventId}/rounds`);
  },

  getRoundById(roundId: UUID) {
    return apiRequest.get<RoundDetailResponse>(`/rounds/${roundId}`);
  },

  updateRound(roundId: UUID, payload: UpdateRoundRequest) {
    return apiRequest.patch<RoundResponse>(`/rounds/${roundId}`, payload);
  },

  deleteRound(roundId: UUID) {
    return apiRequest.delete<void>(`/rounds/${roundId}`);
  },

  openRound(roundId: UUID) {
    return apiRequest.post<RoundResponse>(`/rounds/${roundId}/open`);
  },

  closeRound(roundId: UUID) {
    return apiRequest.post<RoundResponse>(`/rounds/${roundId}/close`);
  },

  lockSubmissions(roundId: UUID) {
    return apiRequest.post<RoundLockResponse>(`/rounds/${roundId}/lock-submissions`);
  },

  getOperationStatus(roundId: UUID) {
    return apiRequest.get<RoundOperationStatusResponse>(
      `/rounds/${roundId}/operation-status`,
    );
  },

  lockGrading(roundId: UUID) {
    return apiRequest.post<RoundLockResponse>(`/rounds/${roundId}/lock-grading`);
  },

  getScoringProgress(roundId: UUID) {
    return apiRequest.get<ScoringProgressResponse>(
      `/rounds/${roundId}/scoring-progress`,
    );
  },

  getGradingStatus(roundId: UUID) {
    return apiRequest.get<ScoringProgressResponse>(
      `/rounds/${roundId}/grading-status`,
    );
  },

  getAdvancementPreview(roundId: UUID) {
    return apiRequest.get<AdvancementPreviewResponse>(
      `/rounds/${roundId}/advancement/suggestions`,
    );
  },

  previewAdvanceRules(roundId: UUID) {
    return apiRequest.post<AdvancementPreviewResponse>(
      `/rounds/${roundId}/advance-rules/preview`,
    );
  },

  confirmAdvancement(roundId: UUID, payload: ConfirmAdvancementRequest) {
    return apiRequest.post<ConfirmAdvancementResponse>(
      `/rounds/${roundId}/advancement/confirm`,
      payload,
    );
  },

  overrideAdvancement(roundId: UUID, payload: ConfirmAdvancementRequest) {
    return apiRequest.post<ConfirmAdvancementResponse>(
      `/rounds/${roundId}/advancement/override`,
      payload,
    );
  },

  getAdvanceRules(roundId: UUID) {
    return apiRequest.get<AdvanceRuleResponse[]>(
      `/rounds/${roundId}/advance-rules`,
    );
  },

  createAdvanceRule(roundId: UUID, payload: CreateAdvanceRuleRequest) {
    return apiRequest.post<AdvanceRuleResponse>(
      `/rounds/${roundId}/advance-rules`,
      payload,
    );
  },

  updateAdvanceRule(ruleId: UUID, payload: UpdateAdvanceRuleRequest) {
    return apiRequest.patch<AdvanceRuleResponse>(
      `/advance-rules/${ruleId}`,
      payload,
    );
  },

  deleteAdvanceRule(ruleId: UUID) {
    return apiRequest.delete<void>(`/advance-rules/${ruleId}`);
  },

  getJudgeAssignments(roundId: UUID) {
    return apiRequest.get<JudgeAssignmentResponse[]>(
      `/rounds/${roundId}/judge-assignments`,
    );
  },

  assignJudge(roundId: UUID, payload: AssignJudgeRequest) {
    return apiRequest.post<JudgeAssignmentResponse>(
      `/rounds/${roundId}/judge-assignments`,
      payload,
    );
  },

  removeJudgeAssignment(roundId: UUID, assignmentId: UUID) {
    return apiRequest.delete<void>(
      `/rounds/${roundId}/judge-assignments/${assignmentId}`,
    );
  },
};
