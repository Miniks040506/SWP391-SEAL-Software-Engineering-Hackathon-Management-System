export interface RankingEntry {
  rank: number;
  team: string;
  members: string;
  score: number;
  track: string;
  round: string;
}


//RIEL REQ/RES

import type { ISODateTime, UUID } from "@/types/common.types";

export type RankingResponse = {
  id: UUID;
  submissionId: UUID;
  teamId: UUID;
  teamName: string;
  roundId: UUID;
  trackId?: UUID;
  totalScore: number;
  rankPosition: number;
  advanced: boolean;
};

export type RecalculateRankingRequest = {
  roundId: UUID;
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

export type PublishResultsRequest = {
  title?: string;
  content?: string;
  sendNotification?: boolean;
  createAnnouncement?: boolean;
};

export type PublishResultsResponse = {
  eventId: UUID;
  publishedAt: ISODateTime;
  announcementId?: UUID;
  notifiedCount: number;
};

