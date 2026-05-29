import type { ISODateTime, UUID } from "@/types/common.types";

export type CreateNotificationRequest = {
  eventId?: UUID;
  type: string;
  title: string;
  body: string;
  targetScope: string;
  targetId?: UUID;
  channel?: string;
  scheduledAt?: ISODateTime;
};

export type NotificationResponse = {
  id: UUID;
  eventId?: UUID;
  type: string;
  title: string;
  body: string;
  targetScope: string;
  targetId?: UUID;
  channel?: string;
  status: string;
  scheduledAt?: ISODateTime;
  sentAt?: ISODateTime;
  read: boolean;
};

export type GetMyNotificationsParams = {
  read?: boolean;
  page?: number;
  size?: number;
};
