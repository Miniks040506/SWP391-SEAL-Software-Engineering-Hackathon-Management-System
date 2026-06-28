import type { ISODateTime, UUID } from "@/types/common.types";

export interface RankingEntry {
  rank: number;
  team: string;
  members: string;
  score: number;
  track: string;
  round: string;
}

export type ScoreBreakdown = Record<string, Record<string, number>>;

export type RankingResponse = {
  id: UUID;
  eventId: UUID;
  eventName?: string | null;
  submissionId: UUID;
  teamId: UUID;
  teamName: string;
  projectTitle?: string | null;
  roundId: UUID;
  roundName?: string | null;
  trackId?: UUID | null;
  trackName?: string | null;
  totalScore: number;
  rankPosition: number;
  advanced: boolean;
  judgeCount?: number | null;
  scoreBreakdown?: ScoreBreakdown | null;
  calculatedAt?: ISODateTime | null;
  published?: boolean | null;
};

export type RecalculateRankingRequest = {
  roundId: UUID;
  trackId?: UUID;
};

export type RankingCalculationParams = {
  trackId?: UUID;
};

export type RankingRecalculationResponse = {
  roundId: UUID;
  trackId?: UUID;
  rankingCount: number;
  calculatedAt: ISODateTime;
};

export type TeamRankingHistoryResponse = {
  roundId: UUID;
  roundName: string;
  trackId?: UUID;
  trackName?: string;
  totalScore: number;
  rankPosition: number;
  advanced: boolean;
};

export type GetRankingsParams = {
  eventId?: UUID;
  roundId?: UUID;
  trackId?: UUID;
};

export type LeaderboardParams = {
  roundId?: UUID;
  trackId?: UUID;
};

export type RoundRankingParams = {
  trackId?: UUID;
};

export type PublishResultsRequest = {
  title?: string;
  content?: string;
  sendNotification?: boolean;
  createAnnouncement?: boolean;
  announcementTitle?: string;
  announcementBody?: string;
  sendEmail?: boolean;
  sendInApp?: boolean;
};

export type PublishResultsResponse = {
  eventId: UUID;
  roundId?: UUID | null;
  publishedAt: ISODateTime;
  announcementId?: UUID | null;
  notifiedCount: number;
  notificationSent?: boolean;
  emailQueued?: boolean;
  publishedRankingCount?: number;
};

export type TeamScoreCriterionResponse = {
  eventCriteriaId: UUID;
  criteriaName: string;
  category?: string | null;
  technical?: boolean | null;
  averageScore: number;
  maxScore?: number | null;
  weight?: number | null;
  judgeCount: number;
};

export type TeamDetailedScoreResponse = {
  eventId: UUID;
  eventName: string;
  teamId: UUID;
  teamName: string;
  submissionId: UUID;
  roundId: UUID;
  roundName: string;
  trackId: UUID;
  trackName: string;
  totalScore: number;
  rankPosition: number;
  advanced: boolean;
  judgeCount: number;
  publishedAt?: ISODateTime | null;
  criteriaScores: TeamScoreCriterionResponse[];
};
