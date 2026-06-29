import type { ISODateTime, UUID } from "@/types/common.types";

export type CreateDisqualificationRequest = {
  submissionId: UUID;
  reason: string;
  evidenceUrl?: string;
};

export type DisqualifySubmissionRequest = {
  reason: string;
  evidenceUrl?: string;
};

export type UpdateAppealRequest = {
  appealNote: string;
};

export type OverturnDisqualificationRequest = {
  reason: string;
};

export type GetEventDisqualificationsParams = {
  roundId?: UUID;
  trackId?: UUID;
  appealStatus?: "PENDING" | "UPHELD" | "OVERTURNED" | string;
};

export type DisqualificationResponse = {
  id: UUID;
  submissionId: UUID;
  issuedBy: UUID;
  issuedByName?: string;
  teamId: UUID;
  teamName: string;
  eventId: UUID;
  eventName: string;
  roundId: UUID;
  roundName: string;
  trackId?: UUID;
  trackName?: string;
  reason: string;
  evidenceUrl?: string;
  appealNote?: string;
  appealStatus?: "PENDING" | "UPHELD" | "OVERTURNED" | string;
  submissionStatus: string;
  teamStatus: string;
  issuedAt: ISODateTime;
  rankingRecalculated: boolean;
  clearedAwardCount: number;
};
