export type SuggestedAdvancementStatus = 'ADVANCED' | 'ELIMINATED' | 'WILDCARD' | 'WAITING';
export type FinalAdvancementStatus = 'WAITING' | 'ADVANCED' | 'ELIMINATED';

export interface AdvancementCandidateRow {
  teamId: string;
  teamName: string;
  projectTitle?: string | null;
  trackId?: string | null;
  trackName?: string | null;
  roundId: string;
  roundName: string;
  rankingId?: string | null;
  rankPosition?: number | null;
  totalScore?: number | null;
  ruleType?: string | null;
  ruleMatched?: boolean;
  suggestedStatus: SuggestedAdvancementStatus;
  finalStatus?: FinalAdvancementStatus | null;
  overrideReason?: string | null;
}

export interface AdvancementPreviewResponse {
  roundId: string;
  roundName: string;
  eventId: string;
  eventName: string;
  gradingLocked: boolean;
  rankingCalculated: boolean;
  advancementConfirmed: boolean;
  advancedCount: number;
  eliminatedCount: number;
  candidates: AdvancementCandidateRow[];
}

export interface AdvancementOverrideRequest {
  teamId: string;
  finalStatus: 'ADVANCED' | 'ELIMINATED';
  reason: string;
}

export interface ConfirmAdvancementRequest {
  overrideRows?: AdvancementOverrideRequest[];
  confirmNote?: string;
}

export interface AdvancementConfirmResponse extends AdvancementPreviewResponse {
  confirmedAt: string;
  confirmedBy?: string | null;
}

export interface TeamAdvancementStatusResponse {
  teamId: string;
  teamName: string;
  eventId: string;
  eventName: string;
  currentRoundId?: string | null;
  currentRoundName?: string | null;
  status: FinalAdvancementStatus;
  message: string;
  nextRoundId?: string | null;
  nextRoundName?: string | null;
  canAccessNextRound: boolean;
}
