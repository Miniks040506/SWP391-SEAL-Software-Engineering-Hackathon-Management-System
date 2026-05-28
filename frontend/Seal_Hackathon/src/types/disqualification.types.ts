import type { ISODateTime, UUID } from "@/types/common.types";

export type CreateDisqualificationRequest = {
  submissionId: UUID;
  reason: string;
  evidenceUrl?: string;
};

export type UpdateAppealRequest = {
  appealNote: string;
};

export type OverturnDisqualificationRequest = {
  reason: string;
};

export type DisqualificationResponse = {
  id: UUID;
  submissionId: UUID;
  issuedBy: UUID;
  reason: string;
  evidenceUrl?: string;
  appealNote?: string;
  appealStatus?: string;
  issuedAt: ISODateTime;
};
