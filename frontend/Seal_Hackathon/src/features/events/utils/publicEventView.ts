import { format, isValid, parseISO } from "date-fns";
import type { AnnouncementResponse } from "@/types/announcement.types";
import type { EventDetailResponse, EventSummaryResponse } from "@/types/event.types";
import type { PrizeResponse } from "@/types/prize.types";
import type { RankingResponse } from "@/types/ranking.types";
import type { RoundResponse } from "@/types/round.types";
import type { TrackResponse } from "@/types/track.types";

export type PublicAnnouncementView = {
  id: string;
  title: string;
  text: string;
  detail?: string;
  date: string;
  phase?: number;
  pinned?: boolean;
};

export type PublicPrizeView = {
  id: string;
  rank: string;
  value: string;
  title: string;
  description?: string;
  trackId?: string;
};

export type PublicPrizeGroup = {
  id: string;
  name: string;
  prizes: PublicPrizeView[];
};

export function formatDateTime(value?: string | null) {
  if (!value) return "TBA";

  const date = parseISO(value);

  if (!isValid(date)) {
    return value;
  }

  return format(date, "dd MMM yyyy, HH:mm");
}

export function formatShortDate(value?: string | null) {
  if (!value) return "TBA";

  const date = parseISO(value);

  if (!isValid(date)) {
    return value;
  }

  return format(date, "dd MMM yyyy");
}

export function normalizeStatus(status?: string | null) {
  return (status || "").trim().toUpperCase();
}

export function isDraftEvent(status?: string | null) {
  return normalizeStatus(status) === "DRAFT";
}

export function isRegistrationOpen(status?: string | null) {
  const value = normalizeStatus(status);

  return [
    "REGISTRATION",
    "REGISTRATION_OPEN",
    "OPEN",
    "ONGOING_REGISTRATION",
  ].includes(value);
}

export function isOngoingEvent(status?: string | null) {
  const value = normalizeStatus(status);

  return ["ON_GOING", "ONGOING", "IN_PROGRESS"].includes(value);
}

export function isJudgingEvent(status?: string | null) {
  return normalizeStatus(status) === "JUDGING";
}

export function isCancelledEvent(status?: string | null) {
  return normalizeStatus(status) === "CANCELLED";
}

export function isCompletedEvent(status?: string | null) {
  const value = normalizeStatus(status);

  return [
    "COMPLETED",
    "ENDED",
    "FINISHED",
    "CLOSED",
    "RESULT_PUBLISHED",
  ].includes(value);
}

export function getDisplayStatus(status?: string | null) {
  const value = normalizeStatus(status);

  if (isDraftEvent(value)) return "Draft";
  if (isRegistrationOpen(value)) return "Registration Open";
  if (isOngoingEvent(value)) return "Ongoing";
  if (isJudgingEvent(value)) return "Judging";
  if (isCompletedEvent(value)) return "Completed";
  if (isCancelledEvent(value)) return "Cancelled";

  return status || "Unknown";
}

export function getStatusBadgeClass(status?: string | null) {
  if (isDraftEvent(status)) {
    return "border-slate-200 bg-slate-50 text-slate-500";
  }

  if (isRegistrationOpen(status)) {
    return "border-emerald-100 bg-emerald-50 text-emerald-600";
  }

  if (isOngoingEvent(status)) {
    return "border-yellow-100 bg-yellow-50 text-yellow-600";
  }

  if (isJudgingEvent(status)) {
    return "border-violet-100 bg-violet-50 text-violet-600";
  }

  if (isCompletedEvent(status)) {
    return "border-indigo-100 bg-indigo-50 text-indigo-600";
  }

  if (isCancelledEvent(status)) {
    return "border-rose-100 bg-rose-50 text-rose-600";
  }

  return "border-slate-200 bg-slate-50 text-slate-500";
}

export function getSeasonLabel(season?: string | null, year?: number | null) {
  const seasonText = season
    ? season.charAt(0).toUpperCase() + season.slice(1).toLowerCase()
    : "Season";

  return year ? `${seasonText} ${year}` : seasonText;
}

export function getEventTitle(event: EventSummaryResponse | EventDetailResponse) {
  return event.name;
}

export function getEventDescription(event: EventDetailResponse) {
  return (
    event.description ||
    "Explore event details, competitive tracks, rounds, prizes, announcements, and public results."
  );
}

export function toAnnouncementViews(
  announcements: AnnouncementResponse[] = [],
): PublicAnnouncementView[] {
  return announcements.map((announcement) => ({
    id: announcement.id,
    title: announcement.title,
    text: announcement.title,
    detail: announcement.content,
    date: formatDateTime(announcement.publishedAt),
    phase: announcement.resultAnnouncement ? 3 : announcement.pinned ? 2 : undefined,
    pinned: announcement.pinned,
  }));
}

export function toPrizeView(prize: PrizeResponse): PublicPrizeView {
  const rank =
    prize.rankPosition != null
      ? `Rank ${prize.rankPosition}`
      : prize.title || "Prize";

  const numericValue =
    typeof prize.value === "string" ? Number(prize.value) : prize.value;

  const value =
    numericValue != null && !Number.isNaN(numericValue)
      ? `${numericValue.toLocaleString()} ${prize.currency || "VND"}`
      : prize.sponsorName || "Prize package";

  return {
    id: prize.id,
    rank,
    value,
    title: prize.title || rank,
    description: prize.description,
    trackId: prize.trackId,
  };
}

export function groupPrizesByTrack(
  prizes: PrizeResponse[] = [],
  tracks: TrackResponse[] = [],
): PublicPrizeGroup[] {
  const mapped = prizes.map(toPrizeView);

  const groups = tracks
    .map((track) => ({
      id: track.id,
      name: track.name,
      prizes: mapped.filter((prize) => prize.trackId === track.id),
    }))
    .filter((group) => group.prizes.length > 0);

  const generalPrizes = mapped.filter((prize) => !prize.trackId);

  if (generalPrizes.length > 0) {
    groups.unshift({
      id: "general",
      name: "General Prizes",
      prizes: generalPrizes,
    });
  }

  return groups;
}

export function buildRoundTimelineSteps(rounds: RoundResponse[] = []) {
  return [...rounds]
    .sort((a, b) => Number(a.orderIndex ?? 0) - Number(b.orderIndex ?? 0))
    .map((round, index) => ({
      label: `Round ${index + 1}`,
      title: round.name,
      duration: round.isFinal ? "Final round" : undefined,
    }));
}

export function getCurrentPhase(rounds: RoundResponse[] = [], status?: string | null) {
  if (isCompletedEvent(status)) {
    return rounds.length || 1;
  }

  const activeIndex = rounds.findIndex(
    (round) => normalizeStatus(round.status) === "ONGOING",
  );

  if (activeIndex >= 0) {
    return activeIndex + 1;
  }

  return 1;
}

export function getTrackNameById(
  trackId: string | null | undefined,
  tracks: TrackResponse[] = [],
) {
  if (!trackId) return "General";
  return tracks.find((track) => track.id === trackId)?.name || "General";
}

export function getRankingTrackOptions(
  rankings: RankingResponse[],
  tracks: TrackResponse[] = [],
) {
  const ids = [...new Set(rankings.map((row) => row.trackId).filter(Boolean))];

  return [
    { value: "All", label: "All Categories" },
    ...ids.map((id) => ({
      value: id,
      label: getTrackNameById(id, tracks),
    })),
  ];
}