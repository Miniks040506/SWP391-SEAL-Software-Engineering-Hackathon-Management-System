import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  CreateDisqualificationRequest,
  DisqualificationResponse,
  DisqualifySubmissionRequest,
  GetEventDisqualificationsParams,
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

  disqualifySubmissionById(
    submissionId: UUID,
    payload: DisqualifySubmissionRequest,
  ) {
    return apiRequest.post<DisqualificationResponse>(
      `/submissions/${submissionId}/disqualify`,
      payload,
    );
  },

  getEventDisqualifications(
    eventId: UUID,
    params?: GetEventDisqualificationsParams,
  ) {
    return apiRequest.get<DisqualificationResponse[]>(
      `/events/${eventId}/disqualifications`,
      { params },
    );
  },

  getActiveTeamDisqualifications(teamId: UUID) {
    return apiRequest.get<DisqualificationResponse[]>(
      `/teams/${teamId}/disqualifications/active`,
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
