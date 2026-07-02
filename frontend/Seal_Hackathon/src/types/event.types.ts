export type EventStatus = "Upcoming" | "Ongoing" | "Ended";

export interface Track {
  name: string;
  desc: string;
  rounds: Round[];
  prizes: Prize[];
}

export interface Round {
  id: string;
  name: string;
  duration: string;
}

export interface Prize {
  rank: string;
  value: string;
}

export interface Announcement {
  date: string;
  text: string;
  /* Optional phase tag shown in AnnouncementModal. */
  phase?: number;
  /* Optional extended body shown in AnnouncementModal detail block. */
  detail?: string;
}

export interface Event {
  id: string;
  title: string;
  season: string;
  status: EventStatus;
  registrationOpen: boolean;
  currentPhase: number;
  description: string;
  startDate: string;
  endDate: string;
  tracks: Track[];
  announcements: Announcement[];
}

//RIEL REQ/RES

import type { ISODateTime, UUID } from "@/types/common.types";
import type { RoundResponse } from "@/types/round.types";
import type { TrackResponse } from "@/types/track.types";

export type CreateEventRequest = {
  name: string;
  description?: string | null;
  season: string;
  year: number;
  registrationStartAt?: ISODateTime;
  registrationEndAt?: ISODateTime;
  bannerUrl?: string | null;
  status?: string | null;
};

export type UpdateEventRequest = {
  name?: string;
  description?: string | null;
  season?: string;
  year?: number;
  registrationStartAt?: ISODateTime;
  registrationEndAt?: ISODateTime;
  bannerUrl?: string | null;
  status?: string | null;
};

export type EventSummaryResponse = {
  id: UUID;
  name: string;
  season: string;
  year: number;
  status: string;
  bannerUrl?: string | null;
};

export type EventDetailResponse = {
  id: UUID;
  name: string;
  description?: string | null;
  season: string;
  year: number;
  status: string;
  bannerUrl?: string | null;
  registrationStartAt?: ISODateTime;
  registrationEndAt?: ISODateTime;
  resultPublishedAt?: ISODateTime | null;
  tracks: TrackResponse[];
  rounds: RoundResponse[];
};

export type GetEventsParams = {
  season?: string;
  year?: number;
  status?: string | null;
  page?: number;
  size?: number;
};

export type GetEventRankingParams = {
  roundId?: UUID;
  trackId?: UUID;
};

export type GetVarianceDashboardParams = {
  roundId?: UUID;
  trackId?: UUID;
  criteriaType?:
    | "TECHNICAL"
    | "SOFT"
    | "PRESENTATION"
    | "INNOVATION"
    | "BUSINESS"
    | "PROCESS";
  judgeType?: "INTERNAL" | "GUEST";
};
