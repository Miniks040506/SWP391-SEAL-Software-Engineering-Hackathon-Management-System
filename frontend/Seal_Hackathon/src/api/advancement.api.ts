import { apiRequest } from './apiRequest';
import type {
  AdvancementCandidateRow,
  AdvancementConfirmResponse,
  AdvancementPreviewResponse,
  ConfirmAdvancementRequest,
  FinalAdvancementStatus,
  SuggestedAdvancementStatus,
  TeamAdvancementStatusResponse,
} from '../types/advancement.types';
import type {
  AdvancementPreviewResponse as BackendAdvancementPreviewResponse,
  ConfirmAdvancementRequest as BackendConfirmAdvancementRequest,
  ConfirmAdvancementResponse as BackendConfirmAdvancementResponse,
  TeamAdvancementDecisionResponse as BackendTeamAdvancementDecisionResponse,
} from '../types/round.types';
import type {
  TeamAdvancementStatusResponse as BackendTeamAdvancementStatusResponse,
} from '../types/team.types';

function toUiTeamAdvancementStatus(
  response: BackendTeamAdvancementStatusResponse,
): TeamAdvancementStatusResponse {
  const status: FinalAdvancementStatus = !response.advancementConfirmed
    ? 'WAITING'
    : response.advanced
      ? 'ADVANCED'
      : 'ELIMINATED';

  return {
    teamId: response.teamId,
    teamName: response.teamName,
    eventId: response.eventId,
    eventName: response.eventName,
    currentRoundId: response.roundId,
    currentRoundName: response.roundName,
    status,
    message: response.message,
    nextRoundId: response.nextRoundId,
    nextRoundName: response.nextRoundName,
    canAccessNextRound: response.canAccessNextRound,
  };
}

function toSuggestedStatus(
  decision: BackendTeamAdvancementDecisionResponse,
): SuggestedAdvancementStatus {
  return decision.suggestedAdvanced
    ? decision.advanceReason === 'WILDCARD'
      ? 'WILDCARD'
      : 'ADVANCED'
    : 'ELIMINATED';
}

function toUiPreview(
  response: BackendAdvancementPreviewResponse,
): AdvancementPreviewResponse {
  const firstRanking = response.allRankings[0];
  const candidates: AdvancementCandidateRow[] = response.decisions.map((decision) => {
    const ranking = response.allRankings.find(
      (item) => item.teamId === decision.teamId,
    );
    const suggestedStatus = toSuggestedStatus(decision);

    return {
      teamId: decision.teamId,
      teamName: decision.teamName,
      projectTitle: ranking?.projectTitle,
      trackId: decision.trackId,
      trackName: decision.trackName,
      roundId: response.roundId,
      roundName: ranking?.roundName ?? '',
      rankingId: ranking?.id,
      rankPosition: decision.rankPosition,
      totalScore: decision.totalScore,
      ruleType: decision.advanceReason,
      ruleMatched: decision.suggestedAdvanced,
      suggestedStatus,
      finalStatus: decision.finalAdvanced ? 'ADVANCED' : 'ELIMINATED',
      overrideReason: decision.overrideReason,
    };
  });

  return {
    roundId: response.roundId,
    roundName: firstRanking?.roundName ?? '',
    eventId: firstRanking?.eventId ?? '',
    eventName: firstRanking?.eventName ?? '',
    gradingLocked: !response.warnings.some((warning) => warning.includes('not locked')),
    rankingCalculated: response.allRankings.length > 0,
    advancementConfirmed: response.advancementConfirmed,
    advancedCount: candidates.filter(
      (candidate) => candidate.suggestedStatus === 'ADVANCED'
        || candidate.suggestedStatus === 'WILDCARD',
    ).length,
    eliminatedCount: candidates.filter(
      (candidate) => candidate.suggestedStatus === 'ELIMINATED',
    ).length,
    candidates,
  };
}

function toUiConfirm(
  response: BackendConfirmAdvancementResponse,
): AdvancementConfirmResponse {
  return {
    roundId: response.roundId,
    advancedCount: response.advancedCount,
    eliminatedCount: response.eliminatedCount,
    confirmedAt: response.confirmedAt,
    decisions: response.decisions.map((decision) => ({
      teamId: decision.teamId,
      teamName: decision.teamName,
      trackId: decision.trackId,
      trackName: decision.trackName,
      rankPosition: decision.rankPosition,
      totalScore: decision.totalScore,
      ruleType: decision.advanceReason,
      suggestedStatus: toSuggestedStatus(decision),
      finalStatus: decision.finalAdvanced ? 'ADVANCED' : 'ELIMINATED',
      overrideReason: decision.overrideReason,
    })),
    warnings: response.warnings,
  };
}

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
  previewRoundAdvancement: async (roundId: string) => ({
    data: toUiPreview(
      await apiRequest.post<BackendAdvancementPreviewResponse>(
        `/rounds/${roundId}/advancement/suggestions`,
      ),
    ),
  }),

  previewRoundAdvanceRules: async (roundId: string) => ({
    data: toUiPreview(
      await apiRequest.post<BackendAdvancementPreviewResponse>(
        `/rounds/${roundId}/advance-rules/preview`,
      ),
    ),
  }),

  confirmRoundAdvancement: async (roundId: string, payload: ConfirmAdvancementRequest) => ({
    data: toUiConfirm(
      await apiRequest.post<BackendConfirmAdvancementResponse>(
        `/rounds/${roundId}/advancement/confirm`,
        toBackendConfirmRequest(payload),
      ),
    ),
  }),

  getTeamAdvancementStatus: async (teamId: string) => ({
    data: toUiTeamAdvancementStatus(
      await apiRequest.get<BackendTeamAdvancementStatusResponse>(
        `/teams/${teamId}/advancement`,
      ),
    ),
  }),
};
