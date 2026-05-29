import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  CalibrationDistributionResponse,
  CalibrationRoundDetailResponse,
  CalibrationRoundResponse,
  CalibrationScoreResponse,
  CreateCalibrationRoundRequest,
  SubmitCalibrationScoreRequest,
  UpdateCalibrationRoundRequest,
} from "@/types/calibration.types";

export const calibrationApi = {
  createCalibrationRound(payload: CreateCalibrationRoundRequest) {
    return apiRequest.post<CalibrationRoundResponse>("/calibrations", payload);
  },

  getCalibrationRoundsByEvent(eventId: UUID) {
    return apiRequest.get<CalibrationRoundResponse[]>(
      `/calibrations/events/${eventId}`,
    );
  },

  getCalibrationRoundById(calibrationId: UUID) {
    return apiRequest.get<CalibrationRoundDetailResponse>(
      `/calibrations/${calibrationId}`,
    );
  },

  updateCalibrationRound(calibrationId: UUID, payload: UpdateCalibrationRoundRequest) {
    return apiRequest.patch<CalibrationRoundResponse>(
      `/calibrations/${calibrationId}`,
      payload,
    );
  },

  submitCalibrationScore(calibrationId: UUID, payload: SubmitCalibrationScoreRequest) {
    return apiRequest.post<CalibrationScoreResponse>(
      `/calibrations/${calibrationId}/scores`,
      payload,
    );
  },

  getDistribution(calibrationId: UUID) {
    return apiRequest.get<CalibrationDistributionResponse>(
      `/calibrations/${calibrationId}/distribution`,
    );
  },

  publishDistribution(calibrationId: UUID) {
    return apiRequest.post<CalibrationRoundResponse>(
      `/calibrations/${calibrationId}/publish-distribution`,
    );
  },
};
