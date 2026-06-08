import type { ISODateTime, UUID } from "@/types/common.types";

export type AnnouncementTargetScope =
  | "ALL"
  | "TRACK"
  | "TEAM"
  | "JUDGE"
  | "COORDINATION"
  | "STUDENT"
  | "SINGLE_USER";

export type CreateAnnouncementRequest = {
  title: string;
  content: string;
  pinned?: boolean;
  resultAnnouncement?: boolean;
  publishNow?: boolean;
  sendEmail?: boolean;
  sendInApp?: boolean;
  scheduledAt?: ISODateTime;
  targetScope?: AnnouncementTargetScope;
  targetId?: UUID;
  targetTrackIds?: UUID[];
  targetRoleNames?: string[];
};

export type UpdateAnnouncementRequest = {
  title?: string;
  content?: string;
  pinned?: boolean;
  resultAnnouncement?: boolean;
  sendEmail?: boolean;
  sendInApp?: boolean;
  scheduledAt?: ISODateTime;
  targetScope?: AnnouncementTargetScope;
  targetId?: UUID;
  targetTrackIds?: UUID[];
  targetRoleNames?: string[];
};

export type AnnouncementResponse = {
  id: UUID;
  eventId: UUID;
  title: string;
  content: string;
  pinned: boolean;
  resultAnnouncement: boolean;
  publishedAt?: ISODateTime | null;
  createdBy: UUID;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "CANCELLED";
  sendEmail: boolean;
  sendInApp: boolean;
  scheduledAt?: ISODateTime | null;
  targetScope: AnnouncementTargetScope;
  targetId?: UUID | null;
  targetTrackIds: UUID[];
  targetRoleNames: string[];
};
