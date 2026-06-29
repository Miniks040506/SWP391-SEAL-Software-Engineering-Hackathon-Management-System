import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  AssignPrizesFromRankingRequest,
  AwardPrizeRequest,
  ClearPrizeAwardRequest,
  CreatePrizeRequest,
  PrizeAssignmentResponse,
  PrizeResponse,
  UpdatePrizeRequest,
} from "@/types/prize.types";

export const prizeApi = {
  createPrize(payload: CreatePrizeRequest) {
    return apiRequest.post<PrizeResponse>("/prizes", payload);
  },

  getPrizesByEvent(eventId: UUID) {
    return apiRequest.get<PrizeResponse[]>(`/prizes/events/${eventId}`);
  },

  getPublishedAwards(eventId: UUID) {
    return apiRequest.get<PrizeResponse[]>(`/events/${eventId}/awards`);
  },

  getPrizeById(prizeId: UUID) {
    return apiRequest.get<PrizeResponse>(`/prizes/${prizeId}`);
  },

  updatePrize(prizeId: UUID, payload: UpdatePrizeRequest) {
    return apiRequest.patch<PrizeResponse>(`/prizes/${prizeId}`, payload);
  },

  deletePrize(prizeId: UUID) {
    return apiRequest.delete<void>(`/prizes/${prizeId}`);
  },

  assignFromRanking(eventId: UUID, payload?: AssignPrizesFromRankingRequest) {
    return apiRequest.post<PrizeAssignmentResponse>(
      `/events/${eventId}/prizes/assign-from-ranking`,
      payload ?? {},
    );
  },

  awardPrize(prizeId: UUID, payload: AwardPrizeRequest) {
    return apiRequest.post<PrizeResponse>(`/prizes/${prizeId}/award`, payload);
  },

  updatePrizeWinner(prizeId: UUID, payload: AwardPrizeRequest) {
    return apiRequest.patch<PrizeResponse>(`/prizes/${prizeId}/winner`, payload);
  },

  clearAward(prizeId: UUID, payload: ClearPrizeAwardRequest) {
    return apiRequest.post<PrizeResponse>(
      `/prizes/${prizeId}/clear-award`,
      payload,
    );
  },
};
