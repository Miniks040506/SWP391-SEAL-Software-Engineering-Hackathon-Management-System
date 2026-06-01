import { useQuery } from "@tanstack/react-query";
import { announcementApi } from "@/api/announcement.api";
import { eventApi } from "@/api/event.api";
import { prizeApi } from "@/api/prize.api";
import type { UUID } from "@/types/common.types";
import type { GetEventsParams } from "@/types/event.types";

export const publicEventKeys = {
  all: ["public-events"] as const,

  list: (params?: GetEventsParams) =>
    [...publicEventKeys.all, "list", params] as const,

  detail: (eventId?: UUID) =>
    [...publicEventKeys.all, "detail", eventId] as const,

  announcements: (eventId?: UUID) =>
    [...publicEventKeys.all, "announcements", eventId] as const,

  prizes: (eventId?: UUID) =>
    [...publicEventKeys.all, "prizes", eventId] as const,
};

export function usePublicEventsQuery(params?: GetEventsParams) {
  return useQuery({
    queryKey: publicEventKeys.list(params),
    queryFn: () => eventApi.getPublicEvents(params),
  });
}

export function usePublicEventDetailQuery(eventId?: UUID) {
  return useQuery({
    queryKey: publicEventKeys.detail(eventId),
    queryFn: () => eventApi.getEventById(eventId!),
    enabled: Boolean(eventId),
  });
}

export function usePublicEventAnnouncementsQuery(eventId?: UUID) {
  return useQuery({
    queryKey: publicEventKeys.announcements(eventId),
    queryFn: () => announcementApi.getEventAnnouncements(eventId!),
    enabled: Boolean(eventId),
  });
}

export function usePublicEventPrizesQuery(eventId?: UUID) {
  return useQuery({
    queryKey: publicEventKeys.prizes(eventId),
    queryFn: () => prizeApi.getPrizesByEvent(eventId!),
    enabled: Boolean(eventId),
  });
}