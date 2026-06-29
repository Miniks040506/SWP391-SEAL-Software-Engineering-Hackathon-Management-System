import type { ISODateTime, UUID } from "@/types/common.types";

export type CreatePrizeRequest = {
  eventId?: UUID;
  trackId?: UUID;
  rankPosition?: number;
  title?: string;
  description?: string;
  value?: number;
  currency?: string;
  sponsorName?: string;
};

export type UpdatePrizeRequest = {
  rankPosition?: number;
  title?: string;
  description?: string;
  value?: number;
  currency?: string;
  sponsorName?: string;
};

export type AssignPrizesFromRankingRequest = {
  roundId?: UUID;
  trackId?: UUID;
  overwriteExistingAwards?: boolean;
  sendNotification?: boolean;
  sendInApp?: boolean;
  sendEmail?: boolean;
};

export type AwardPrizeRequest = {
  teamId: UUID;
  reason?: string;
  sendNotification?: boolean;
  sendInApp?: boolean;
  sendEmail?: boolean;
};

export type ClearPrizeAwardRequest = {
  reason?: string;
};

export type PrizeResponse = {
  id: UUID;
  eventId: UUID;
  eventName?: string;
  trackId?: UUID;
  trackName?: string;
  rankPosition?: number;
  title?: string;
  description?: string;
  value?: number;
  currency?: string;
  sponsorName?: string;
  awardedTeamId?: UUID;
  awardedTeamName?: string;
  awardedAt?: ISODateTime;
};

export type PrizeAssignmentResponse = {
  eventId: UUID;
  roundId?: UUID;
  trackId?: UUID;
  prizeCount: number;
  awardedCount: number;
  skippedCount: number;
  notificationSent: boolean;
  emailQueued: boolean;
  assignedAt: ISODateTime;
  prizes: PrizeResponse[];
};
