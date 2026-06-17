import type { ISODateTime, UUID } from "@/types/common.types";

export type CreateNotificationRequest = {
  eventId?: UUID;
  type: string;
  title: string;
  body: string;
  targetScope: string;
  targetId?: UUID;
  role?: string;
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
  role?: string;
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


export type UnreadCountResponse = {
  unreadCount: number;
};

export type NotificationFilter = "ALL" | "UNREAD" | "READ";
