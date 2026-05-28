import { apiRequest } from "@/api/apiRequest";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  CreateEventRequest,
  EventDetailResponse,
  EventSummaryResponse,
  GetEventRankingParams,
  GetEventsParams,
  GetVarianceDashboardParams,
  UpdateEventRequest,
} from "@/types/event.types";
import type {
  PublishResultsRequest,
  PublishResultsResponse,
  RankingResponse,
} from "@/types/ranking.types";
import type { VarianceDashboardResponse } from "@/types/system.types";

export const eventApi = {
  createEvent(payload: CreateEventRequest) {
    return apiRequest.post<EventDetailResponse>("/events", payload);
  },

  getEvents(params?: GetEventsParams) {
    return apiRequest.get<PageResponse<EventSummaryResponse>>("/events", {params});
  },

  getEventById(eventId: UUID) {
    return apiRequest.get<EventDetailResponse>(`/events/${eventId}`);
  },

  updateEvent(eventId: UUID, payload: UpdateEventRequest) {
    return apiRequest.patch<EventDetailResponse>(`/events/${eventId}`, payload);
  },

  deleteEvent(eventId: UUID) {
    return apiRequest.delete<void>(`/events/${eventId}`);
  },

  getEventRanking(eventId: UUID, params?: GetEventRankingParams) {
    return apiRequest.get<RankingResponse[]>(`/events/${eventId}/ranking`, {params});
  },

  publishResults(eventId: UUID, payload: PublishResultsRequest) {
    return apiRequest.post<PublishResultsResponse>(
      `/events/${eventId}/publish-results`,
      payload,
    );
  },

  getVarianceDashboard(eventId: UUID, params?: GetVarianceDashboardParams) {
    return apiRequest.get<VarianceDashboardResponse>(
      `/events/${eventId}/variance-dashboard`,
      {params},
    );
  },
};
