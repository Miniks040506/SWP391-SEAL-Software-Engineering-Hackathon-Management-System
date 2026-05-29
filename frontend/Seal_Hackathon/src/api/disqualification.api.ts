import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  CreateDisqualificationRequest,
  DisqualificationResponse,
  OverturnDisqualificationRequest,
  UpdateAppealRequest,
} from "@/types/disqualification.types";

export const disqualificationApi = {
  disqualifySubmission(payload: CreateDisqualificationRequest) {
    return apiRequest.post<DisqualificationResponse>(
      "/disqualifications",
      payload,
    );
  },

  getDisqualificationById(disqualificationId: UUID) {
    return apiRequest.get<DisqualificationResponse>(
      `/disqualifications/${disqualificationId}`,
    );
  },

  updateAppeal(disqualificationId: UUID, payload: UpdateAppealRequest) {
    return apiRequest.patch<DisqualificationResponse>(
      `/disqualifications/${disqualificationId}/appeal`,
      payload,
    );
  },

  overturnDisqualification(
    disqualificationId: UUID,
    payload: OverturnDisqualificationRequest,
  ) {
    return apiRequest.post<DisqualificationResponse>(
      `/disqualifications/${disqualificationId}/overturn`,
      payload,
    );
  },
};
