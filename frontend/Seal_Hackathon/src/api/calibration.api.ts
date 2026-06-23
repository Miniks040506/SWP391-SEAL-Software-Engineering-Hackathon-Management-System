import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  CalibrationDistributionResponse,
  CalibrationRoundDetailResponse,
  CalibrationRoundResponse,
  CalibrationScoreResponse,
  CalibrationScoreSheetResponse,
  CreateCalibrationRoundRequest,
  SubmitCalibrationScoreRequest,
  UpdateCalibrationRoundRequest,
} from "@/types/calibration.types";

export const calibrationApi = {
  createCalibrationRound(payload: CreateCalibrationRoundRequest) {
    return apiRequest.post<CalibrationRoundResponse>("/calibrations", payload);
  },

  createEventCalibrationRound(eventId: UUID, payload: CreateCalibrationRoundRequest) {
    return apiRequest.post<CalibrationRoundResponse>(
      `/events/${eventId}/calibration-rounds`,
      payload,
    );
  },

  getCalibrationRoundsByEvent(eventId: UUID) {
    return apiRequest.get<CalibrationRoundResponse[]>(
      `/calibrations/events/${eventId}`,
    );
  },

  getEventCalibrationRounds(eventId: UUID) {
    return apiRequest.get<CalibrationRoundResponse[]>(
      `/events/${eventId}/calibration-rounds`,
    );
  },

  getCalibrationRoundById(calibrationId: UUID) {
    return apiRequest.get<CalibrationRoundDetailResponse>(
      `/calibrations/${calibrationId}`,
    );
  },

  getCalibrationRoundAlias(calibrationId: UUID) {
    return apiRequest.get<CalibrationRoundDetailResponse>(
      `/calibration-rounds/${calibrationId}`,
    );
  },

  updateCalibrationRound(calibrationId: UUID, payload: UpdateCalibrationRoundRequest) {
    return apiRequest.patch<CalibrationRoundResponse>(
      `/calibrations/${calibrationId}`,
      payload,
    );
  },

  updateCalibrationRoundAlias(calibrationId: UUID, payload: UpdateCalibrationRoundRequest) {
    return apiRequest.patch<CalibrationRoundResponse>(
      `/calibration-rounds/${calibrationId}`,
      payload,
    );
  },

  getScoreSheet(calibrationId: UUID) {
    return apiRequest.get<CalibrationScoreSheetResponse>(
      `/calibrations/${calibrationId}/score-sheet`,
    );
  },

  getScoreSheetAlias(calibrationId: UUID) {
    return apiRequest.get<CalibrationScoreSheetResponse>(
      `/calibration-rounds/${calibrationId}/score-sheet`,
    );
  },

  submitCalibrationScore(calibrationId: UUID, payload: SubmitCalibrationScoreRequest) {
    return apiRequest.post<CalibrationScoreResponse[]>(
      `/calibrations/${calibrationId}/scores`,
      payload,
    );
  },

  submitCalibrationScoreAlias(calibrationId: UUID, payload: SubmitCalibrationScoreRequest) {
    return apiRequest.post<CalibrationScoreResponse[]>(
      `/calibration-rounds/${calibrationId}/scores`,
      payload,
    );
  },

  getMyScores(calibrationId: UUID) {
    return apiRequest.get<CalibrationScoreResponse[]>(
      `/calibrations/${calibrationId}/my-scores`,
    );
  },

  getDistribution(calibrationId: UUID) {
    return apiRequest.get<CalibrationDistributionResponse>(
      `/calibrations/${calibrationId}/distribution`,
    );
  },

  getDistributionAlias(calibrationId: UUID) {
    return apiRequest.get<CalibrationDistributionResponse>(
      `/calibration-rounds/${calibrationId}/distribution`,
    );
  },

  publishDistribution(calibrationId: UUID) {
    return apiRequest.post<CalibrationRoundResponse>(
      `/calibrations/${calibrationId}/publish-distribution`,
    );
  },

  publishDistributionAlias(calibrationId: UUID) {
    return apiRequest.post<CalibrationRoundResponse>(
      `/calibration-rounds/${calibrationId}/publish-distribution`,
    );
  },
};
