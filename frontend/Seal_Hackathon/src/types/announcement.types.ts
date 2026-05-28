import type { ISODateTime, UUID } from "@/types/common.types";

export type CreateAnnouncementRequest = {
  title: string;
  content: string;
  pinned?: boolean;
  resultAnnouncement?: boolean;
  publishNow?: boolean;
};

export type UpdateAnnouncementRequest = {
  title?: string;
  content?: string;
  pinned?: boolean;
  resultAnnouncement?: boolean;
};

export type AnnouncementResponse = {
  id: UUID;
  eventId: UUID;
  title: string;
  content: string;
  pinned: boolean;
  resultAnnouncement: boolean;
  publishedAt?: ISODateTime;
  createdBy: UUID;
};
