import { useQuery } from "@tanstack/react-query";
import { announcementApi } from "@/api/announcement.api";
import { eventApi } from "@/api/event.api";
import { prizeApi } from "@/api/prize.api";
import { roundApi } from "@/api/round.api";
import { trackApi } from "@/api/track.api";
import type { UUID } from "@/types/common.types";
import type { GetEventsParams } from "@/types/event.types";
import { mockCoordinatorService } from "@/features/coordinator/mocks/coordinatorService.mock";

const USE_MOCK = false;

export const publicEventKeys = {
  all: ["public-events"] as const,

  list: (params?: GetEventsParams) =>
    [...publicEventKeys.all, "list", params] as const,

  detail: (eventId?: UUID) =>
    [...publicEventKeys.all, "detail", eventId] as const,

  tracks: (eventId?: UUID) =>
    [...publicEventKeys.all, "tracks", eventId] as const,

  rounds: (eventId?: UUID) =>
    [...publicEventKeys.all, "rounds", eventId] as const,

  announcements: (eventId?: UUID) =>
    [...publicEventKeys.all, "announcements", eventId] as const,

  prizes: (eventId?: UUID) =>
    [...publicEventKeys.all, "prizes", eventId] as const,
    
  publishedAwards: (eventId?: UUID) =>
    [...publicEventKeys.all, "published-awards", eventId] as const,
};

export function usePublicEventsQuery(params?: GetEventsParams) {
  return useQuery({
    queryKey: publicEventKeys.list(params),
    queryFn: () => USE_MOCK ? mockCoordinatorService.eventApi.getAllEvents(params) : eventApi.getPublicEvents(params),
  });
}

export function usePublicEventDetailQuery(eventId?: UUID) {
  return useQuery({
    queryKey: publicEventKeys.detail(eventId),
    queryFn: () => USE_MOCK ? mockCoordinatorService.eventApi.getEventById(eventId!) as any : eventApi.getEventById(eventId!),
    enabled: Boolean(eventId),
  });
}

export function usePublicEventTracksQuery(eventId?: UUID) {
  return useQuery({
    queryKey: publicEventKeys.tracks(eventId),
    queryFn: () => USE_MOCK ? mockCoordinatorService.trackApi.getTracksByEvent(eventId!) as any : trackApi.getTracksByEvent(eventId!),
    enabled: Boolean(eventId),
  });
}

export function usePublicEventRoundsQuery(eventId?: UUID) {
  return useQuery({
    queryKey: publicEventKeys.rounds(eventId),
    queryFn: () => USE_MOCK ? mockCoordinatorService.roundApi.getRoundsByEvent(eventId!) as any : roundApi.getRoundsByEvent(eventId!),
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

export function usePublicEventAwardsQuery(eventId?: UUID) {
  return useQuery({
    queryKey: publicEventKeys.publishedAwards(eventId),
    queryFn: () => USE_MOCK ? mockCoordinatorService.prizeApi.getPublishedAwards(eventId!) as any : prizeApi.getPublishedAwards(eventId!),
    enabled: Boolean(eventId),
  });
}