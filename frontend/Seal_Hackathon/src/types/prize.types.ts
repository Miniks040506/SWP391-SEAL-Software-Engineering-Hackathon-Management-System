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

export type AwardPrizeRequest = {
  teamId: UUID;
};

export type ClearPrizeAwardRequest = {
  reason?: string;
};

export type PrizeResponse = {
  id: UUID;
  eventId: UUID;
  trackId?: UUID;
  rankPosition?: number;
  title?: string;
  description?: string;
  value?: number;
  currency?: string;
  sponsorName?: string;
  awardedTeamId?: UUID;
  awardedAt?: ISODateTime;
};
