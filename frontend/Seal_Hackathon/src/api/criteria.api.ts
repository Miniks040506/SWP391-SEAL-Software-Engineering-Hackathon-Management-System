import { apiRequest } from "@/api/apiRequest";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  CreateEventCriteriaRequest,
  CreateScoringCriteriaRequest,
  EventCriteriaResponse,
  GetEventCriteriaParams,
  GetScoringCriteriaParams,
  ScoringCriteriaResponse,
  UpdateEventCriteriaRequest,
  UpdateScoringCriteriaRequest,
} from "@/types/criteria.types";

export const criteriaApi = {
  getScoringCriteria(params?: GetScoringCriteriaParams) {
    return apiRequest.get<PageResponse<ScoringCriteriaResponse>>(
      "/criteria",
      {params},
    );
  },

  createScoringCriteria(payload: CreateScoringCriteriaRequest) {
    return apiRequest.post<ScoringCriteriaResponse>("/criteria", payload);
  },

  getScoringCriteriaById(criteriaId: UUID) {
    return apiRequest.get<ScoringCriteriaResponse>(`/criteria/${criteriaId}`);
  },

  updateScoringCriteria(criteriaId: UUID, payload: UpdateScoringCriteriaRequest) {
    return apiRequest.patch<ScoringCriteriaResponse>(
      `/criteria/${criteriaId}`,
      payload,
    );
  },

  deactivateScoringCriteria(criteriaId: UUID) {
    return apiRequest.patch<ScoringCriteriaResponse>(
      `/criteria/${criteriaId}/deactivate`,
    );
  },

  getEventCriteria(eventId: UUID, params?: GetEventCriteriaParams) {
    return apiRequest.get<EventCriteriaResponse[]>(
      `/events/${eventId}/criteria`,
      {params},
    );
  },

  createEventCriteria(eventId: UUID, payload: CreateEventCriteriaRequest) {
    return apiRequest.post<EventCriteriaResponse>(
      `/events/${eventId}/criteria`,
      payload,
    );
  },

  updateEventCriteria(eventCriteriaId: UUID, payload: UpdateEventCriteriaRequest) {
    return apiRequest.patch<EventCriteriaResponse>(
      `/event-criteria/${eventCriteriaId}`,
      payload,
    );
  },

  deleteEventCriteria(eventCriteriaId: UUID) {
    return apiRequest.delete<void>(`/event-criteria/${eventCriteriaId}`);
  },

  getCriteriaByRound(roundId: UUID) {
    return apiRequest.get<EventCriteriaResponse[]>(`/rounds/${roundId}/criteria`);
  },
};
