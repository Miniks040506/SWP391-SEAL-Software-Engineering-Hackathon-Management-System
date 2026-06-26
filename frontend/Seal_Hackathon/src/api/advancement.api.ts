import { axiosClient } from './axiosClient';
import type {
  AdvancementPreviewResponse,
  AdvancementConfirmResponse,
  ConfirmAdvancementRequest,
  AdvancementOverrideRequest,
  TeamAdvancementStatusResponse,
} from '../types/advancement.types';

export const advancementApi = {
  previewRoundAdvancement: (roundId: string) =>
    axiosClient.get<AdvancementPreviewResponse>(`/rounds/${roundId}/advancement/suggestions`),

  previewRoundAdvanceRules: (roundId: string) =>
    axiosClient.post<AdvancementPreviewResponse>(`/rounds/${roundId}/advance-rules/preview`),

  confirmRoundAdvancement: (roundId: string, payload: ConfirmAdvancementRequest) =>
    axiosClient.post<AdvancementConfirmResponse>(`/rounds/${roundId}/advancement/confirm`, payload),

  overrideRoundAdvancement: (roundId: string, payload: AdvancementOverrideRequest) =>
    axiosClient.post<AdvancementPreviewResponse>(`/rounds/${roundId}/advancement/override`, payload),

  getTeamAdvancementStatus: (teamId: string) =>
    axiosClient.get<TeamAdvancementStatusResponse>(`/teams/${teamId}/advancement`),
};
