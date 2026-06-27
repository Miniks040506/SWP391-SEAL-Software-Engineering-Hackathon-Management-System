import { axiosClient } from './axiosClient';
import type {
  AdvancementPreviewResponse,
  ConfirmAdvancementRequest,
  AdvancementOverrideRequest,
  TeamAdvancementStatusResponse,
} from '../types/advancement.types';
import type {
  ConfirmAdvancementRequest as BackendConfirmAdvancementRequest,
  ConfirmAdvancementResponse as BackendConfirmAdvancementResponse,
} from '../types/round.types';

function toBackendConfirmRequest(
  payload: ConfirmAdvancementRequest,
): BackendConfirmAdvancementRequest {
  return {
    overrides: payload.overrideRows?.map((override) => ({
      teamId: override.teamId,
      advanced: override.finalStatus === 'ADVANCED',
      reason: override.reason,
    })),
    note: payload.confirmNote,
  };
}

export const advancementApi = {
  previewRoundAdvancement: (roundId: string) =>
    axiosClient.get<AdvancementPreviewResponse>(`/rounds/${roundId}/advancement/suggestions`),

  previewRoundAdvanceRules: (roundId: string) =>
    axiosClient.post<AdvancementPreviewResponse>(`/rounds/${roundId}/advance-rules/preview`),

  confirmRoundAdvancement: (roundId: string, payload: ConfirmAdvancementRequest) =>
    axiosClient.post<BackendConfirmAdvancementResponse>(
      `/rounds/${roundId}/advancement/confirm`,
      toBackendConfirmRequest(payload),
    ),

  overrideRoundAdvancement: (roundId: string, payload: AdvancementOverrideRequest) =>
    axiosClient.post<BackendConfirmAdvancementResponse>(
      `/rounds/${roundId}/advancement/override`,
      toBackendConfirmRequest({ overrideRows: [payload] }),
    ),

  getTeamAdvancementStatus: (teamId: string) =>
    axiosClient.get<TeamAdvancementStatusResponse>(`/teams/${teamId}/advancement`),
};
