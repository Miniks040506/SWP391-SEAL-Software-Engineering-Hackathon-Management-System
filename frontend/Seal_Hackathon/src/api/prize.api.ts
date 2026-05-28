import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  AwardPrizeRequest,
  ClearPrizeAwardRequest,
  CreatePrizeRequest,
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

  getPrizeById(prizeId: UUID) {
    return apiRequest.get<PrizeResponse>(`/prizes/${prizeId}`);
  },

  updatePrize(prizeId: UUID, payload: UpdatePrizeRequest) {
    return apiRequest.patch<PrizeResponse>(`/prizes/${prizeId}`, payload);
  },

  deletePrize(prizeId: UUID) {
    return apiRequest.delete<void>(`/prizes/${prizeId}`);
  },

  awardPrize(prizeId: UUID, payload: AwardPrizeRequest) {
    return apiRequest.post<PrizeResponse>(`/prizes/${prizeId}/award`, payload);
  },

  clearAward(prizeId: UUID, payload: ClearPrizeAwardRequest) {
    return apiRequest.post<PrizeResponse>(
      `/prizes/${prizeId}/clear-award`,
      payload,
    );
  },
};
