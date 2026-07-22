import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import StackedLineChartOutlinedIcon from "@mui/icons-material/StackedLineChartOutlined";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import type { UUID } from "@/types/common.types";
import type { EventSummaryResponse } from "@/types/event.types";
import { getEventSeasonGradient } from "@/utils/eventBanner";

import {
  useCoordinatorEventsQuery,
  useCoordinatorMultipleTracksQueries,
  useCoordinatorMultipleTeamsQueries,
} from "../hooks/useCoordinatorEventQueries";

type EventStatusFilter =
  | "ALL"
  | "ONGOING"
  | "REGISTRATION"
  | "DRAFT"
  | "COMPLETED"
  | "JUDGING"
  | "CANCELLED"
  | "ARCHIVED";

type EventCard = EventSummaryResponse & {
  id: UUID;
  name?: string;
  eventName?: string;
  title?: string;
  status?: string | null;
  season?: string | null;
  year?: number | null;
  bannerUrl?: string | null;
  trackCount?: number | null;
  totalTracks?: number | null;
  registeredTeamCount?: number | null;
  approvedTeamCount?: number | null;
  approvedTeams?: number | null;
  teamCount?: number | null;
  tracks?: unknown[];
};

const statusTabs: Array<{ label: string; value: EventStatusFilter }> = [
  { label: "All", value: "ALL" },
  { label: "Ongoing", value: "ONGOING" },
  { label: "Registration", value: "REGISTRATION" },
  { label: "Draft", value: "DRAFT" },
  { label: "Judging", value: "JUDGING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Archived", value: "ARCHIVED" },
];

const statusMeta: Record<
  string,
  { badge: string; dot: string; label: string }
> = {
  ONGOING: {
    label: "Ongoing",
    badge:
      "border-blue-400/40 bg-blue-500/15 text-blue-100 dark:text-blue-200",
    dot: "bg-blue-400",
  },
  REGISTRATION: {
    label: "Registration",
    badge:
      "border-emerald-400/40 bg-emerald-500/15 text-emerald-100 dark:text-emerald-200",
    dot: "bg-emerald-400",
  },
  DRAFT: {
    label: "Draft",
    badge:
      "border-amber-400/40 bg-amber-500/15 text-amber-100 dark:text-amber-200",
    dot: "bg-amber-400",
  },
  JUDGING: {
    label: "Judging",
    badge:
      "border-orange-400/40 bg-orange-500/15 text-orange-100 dark:text-orange-200",
    dot: "bg-orange-400",
  },
  COMPLETED: {
    label: "Completed",
    badge:
      "border-indigo-400/40 bg-indigo-500/15 text-indigo-100 dark:text-indigo-200",
    dot: "bg-indigo-400",
  },
  CANCELLED: {
    label: "Cancelled",
    badge:
      "border-rose-400/40 bg-rose-500/15 text-rose-100 dark:text-rose-200",
    dot: "bg-rose-400",
  },
  ARCHIVED: {
    label: "Archived",
    badge:
      "border-slate-400/40 bg-slate-500/15 text-slate-100 dark:text-slate-300",
    dot: "bg-slate-400",
  },
};

const chipDotColor: Record<string, string> = {
  ONGOING: "bg-blue-500",
  REGISTRATION: "bg-emerald-500",
  DRAFT: "bg-amber-500",
  JUDGING: "bg-orange-500",
  COMPLETED: "bg-indigo-500",
  CANCELLED: "bg-rose-500",
  ARCHIVED: "bg-slate-400",
};

function getEventId(event: EventSummaryResponse): UUID {
  const raw = event as Partial<EventCard>;
  return (raw.id ?? (raw as { eventId?: UUID }).eventId) as UUID;
}

function getEventName(event: EventSummaryResponse) {
  const raw = event as EventCard;
  return raw.name ?? raw.eventName ?? raw.title ?? "Untitled event";
}

function getEventStatus(event: EventSummaryResponse) {
  const raw = event as EventCard;
  return (raw.status ?? "DRAFT").toUpperCase();
}

function getEventSeason(event: EventSummaryResponse) {
  const raw = event as EventCard;
  return raw.season ?? "";
}

function getEventYear(event: EventSummaryResponse) {
  const raw = event as EventCard;
  return raw.year ?? null;
}

function getTrackCount(
  event: EventSummaryResponse,
  fetchedTrackCounts: Map<UUID, number>,
) {
  const raw = event as EventCard;
  const eventId = getEventId(event);

  if (typeof raw.trackCount === "number") return raw.trackCount;
  if (typeof raw.totalTracks === "number") return raw.totalTracks;
  if (Array.isArray(raw.tracks)) return raw.tracks.length;

  const fetched = fetchedTrackCounts.get(eventId);
  return typeof fetched === "number" ? fetched : null;
}

function getRegisteredTeamCount(
  event: EventSummaryResponse,
  fetchedTeamCounts: Map<UUID, number>,
) {
  const raw = event as EventCard;
  const eventId = getEventId(event);

  if (typeof raw.registeredTeamCount === "number") return raw.registeredTeamCount;

  const fetched = fetchedTeamCounts.get(eventId);
  return typeof fetched === "number" ? fetched : null;
}

function isApiPageResponse(
  value: unknown,
): value is { content: EventSummaryResponse[] } {
  return Boolean(
    value &&
    typeof value === "object" &&
    "content" in value &&
    Array.isArray((value as { content?: unknown }).content),
  );
}

function normalizeEvents(value: unknown): EventSummaryResponse[] {
  if (Array.isArray(value)) return value as EventSummaryResponse[];
  if (isApiPageResponse(value)) return value.content;
  return [];
}

// Shared with the edit + detail pages so a bannerless event shows the same
// season colour everywhere. See utils/eventBanner.ts.
const seasonGradient = getEventSeasonGradient;

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatCompetitionPeriod(event: EventSummaryResponse) {
  const start = formatDate(event.competitionStartAt);
  const end = formatDate(event.competitionEndAt);
  if (start === "—" && end === "—") return "—";
  return `${start} → ${end}`;
}

function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta[status] ?? statusMeta.ARCHIVED;
  const isLive = status === "ONGOING";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] backdrop-blur-md",
        meta.badge,
      ].join(" ")}
    >
      <span className="relative flex h-1.5 w-1.5">
        {isLive && (
          <span
            className={[
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:hidden",
              meta.dot,
            ].join(" ")}
          />
        )}
        <span
          className={["relative inline-flex h-1.5 w-1.5 rounded-full", meta.dot].join(
            " ",
          )}
        />
      </span>
      {isLive ? "Live" : meta.label}
    </span>
  );
}

function HeroStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 backdrop-blur-md transition-colors hover:bg-white/10">
      <div
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          accent,
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xl font-black leading-tight text-white tabular-nums">
          {value}
        </p>
        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-21/9 w-full animate-pulse bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-4 p-6">
        <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-6 w-3/4 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-1/2 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-16 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-11 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

function EventManagementCard({
  event,
  trackCount,
  registeredTeamCount,
}: {
  event: EventSummaryResponse;
  trackCount: number | null;
  registeredTeamCount: number | null;
}) {
  const navigate = useNavigate();
  const [bannerFailed, setBannerFailed] = useState(false);

  const eventId = getEventId(event);
  const name = getEventName(event);
  const status = getEventStatus(event);
  const season = getEventSeason(event);
  const year = getEventYear(event);
  const bannerUrl = (event as EventCard).bannerUrl;
  const showBanner = Boolean(bannerUrl) && !bannerFailed;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50 dark:hover:shadow-blue-500/10">
      {/* Banner — gradient base always rendered; image overlays when it loads */}
      <div className="relative aspect-21/9 w-full overflow-hidden">
        <div
          className={[
            "relative flex h-full w-full items-end bg-linear-to-br p-5",
            seasonGradient(season),
          ].join(" ")}
        >
          {/* Decorative rings */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full border-[14px] border-white/15"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-2 top-10 h-20 w-20 rounded-full border-8 border-white/10"
          />
          <span className="text-4xl font-black uppercase tracking-tight text-white/25 select-none">
            {season || "SEAL"} {year ?? ""}
          </span>
        </div>

        {showBanner && (
          <img
            src={bannerUrl as string}
            alt=""
            loading="lazy"
            onError={() => setBannerFailed(true)}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}

        {/* Scrim for badge legibility */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/50 to-transparent"
        />

        <div className="absolute left-4 top-4">
          <StatusBadge status={status} />
        </div>

        <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
          {season ? `${season} ${year ?? ""}`.trim() : (year ?? "SEAL")}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="min-h-14 text-lg font-extrabold leading-snug text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-300">
          {name}
        </h3>

        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <EventAvailableOutlinedIcon sx={{ fontSize: 17 }} className="text-slate-400" />
          <span className="font-semibold tabular-nums">
            {formatCompetitionPeriod(event)}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              <StackedLineChartOutlinedIcon sx={{ fontSize: 14 }} />
              Tracks
            </div>
            <p className="mt-1 text-2xl font-black text-slate-900 tabular-nums dark:text-white">
              {trackCount ?? "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              <GroupsOutlinedIcon sx={{ fontSize: 14 }} />
              Teams
            </div>
            <p className="mt-1 text-2xl font-black text-slate-900 tabular-nums dark:text-white">
              {registeredTeamCount ?? "—"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate(`/coordinator/events/${eventId}/edit`)}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] motion-reduce:active:scale-100"
          >
            <EditOutlinedIcon sx={{ fontSize: 18 }} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => navigate(`/coordinator/events/${eventId}/view`)}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] motion-reduce:active:scale-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
          >
            <RemoveRedEyeOutlinedIcon sx={{ fontSize: 18 }} />
            View
          </button>
        </div>
      </div>
    </article>
  );
}

export function CoordinatorEventsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<EventStatusFilter>("ALL");
  const [search, setSearch] = useState("");

  // 1. Gọi hook lấy danh sách events
  const eventsQuery = useCoordinatorEventsQuery({ page: 0, size: 100 });

  const apiEvents = useMemo(
    () => normalizeEvents(eventsQuery.data),
    [eventsQuery.data],
  );

  // 2. Lấy tất cả ID của Events để truyền vào Hook Tracks
  const eventIds = useMemo(() => apiEvents.map(getEventId), [apiEvents]);

  // 3. Gọi hook lấy số lượng Tracks
  const trackCountQueries = useCoordinatorMultipleTracksQueries(eventIds);

  const fetchedTrackCounts = useMemo(() => {
    const map = new Map<UUID, number>();

    apiEvents.forEach((event, index) => {
      const eventId = getEventId(event);
      const data = trackCountQueries[index]?.data;

      if (Array.isArray(data)) {
        map.set(eventId, data.length);
      }
    });

    return map;
  }, [apiEvents, trackCountQueries]);

  // 4. Gọi hook lấy số lượng Teams
  const teamQueries = useCoordinatorMultipleTeamsQueries(eventIds);

  const fetchedTeamCounts = useMemo(() => {
    const map = new Map<UUID, number>();

    apiEvents.forEach((event, index) => {
      const eventId = getEventId(event);
      const data = teamQueries[index]?.data?.content;

      if (Array.isArray(data)) {
        const registeredCount = data.filter(
          (t) => ["REGISTERED", "COMPETING", "ADVANCED", "WINNER"].includes((t.status ?? "").toUpperCase())
        ).length;
        map.set(eventId, registeredCount);
      }
    });

    return map;
  }, [apiEvents, teamQueries]);

  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    apiEvents.forEach((event) => {
      const status = getEventStatus(event);
      counts.set(status, (counts.get(status) ?? 0) + 1);
    });
    return counts;
  }, [apiEvents]);

  const totalRegisteredTeams = useMemo(() => {
    let sum = 0;
    apiEvents.forEach((event) => {
      const count = getRegisteredTeamCount(event, fetchedTeamCounts);
      if (typeof count === "number") sum += count;
    });
    return sum;
  }, [apiEvents, fetchedTeamCounts]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return apiEvents.filter((event) => {
      if (activeFilter !== "ALL" && getEventStatus(event) !== activeFilter) {
        return false;
      }
      if (query && !getEventName(event).toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [activeFilter, apiEvents, search]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero command header */}
      <header className="relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-8">
        {/* Glow accents */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-600/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl"
        />
        {/* Dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.5) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-400">
              Coordinator Workspace
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Event{" "}
              <span className="bg-linear-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                Management
              </span>
            </h1>

            <p className="mt-2 max-w-xl text-sm font-medium text-slate-400 sm:text-base">
              Orchestrate every SEAL hackathon season — timelines, tracks,
              teams, and configurations in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/coordinator/events/create")}
            className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            <AddOutlinedIcon sx={{ fontSize: 20 }} />
            Create New Event
          </button>
        </div>

        <div className="relative mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <HeroStat
            icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 20 }} className="text-blue-300" />}
            label="Total events"
            value={eventsQuery.isLoading ? "…" : apiEvents.length}
            accent="bg-blue-500/20"
          />
          <HeroStat
            icon={<BoltOutlinedIcon sx={{ fontSize: 20 }} className="text-sky-300" />}
            label="Live now"
            value={eventsQuery.isLoading ? "…" : (statusCounts.get("ONGOING") ?? 0)}
            accent="bg-sky-500/20"
          />
          <HeroStat
            icon={<HowToRegOutlinedIcon sx={{ fontSize: 20 }} className="text-emerald-300" />}
            label="In registration"
            value={eventsQuery.isLoading ? "…" : (statusCounts.get("REGISTRATION") ?? 0)}
            accent="bg-emerald-500/20"
          />
          <HeroStat
            icon={<GroupsOutlinedIcon sx={{ fontSize: 20 }} className="text-indigo-300" />}
            label="Registered teams"
            value={eventsQuery.isLoading ? "…" : totalRegisteredTeams}
            accent="bg-indigo-500/20"
          />
        </div>
      </header>

      {/* Toolbar: search + status filter chips */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full max-w-sm">
          <SearchOutlinedIcon
            sx={{ fontSize: 20 }}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            aria-label="Search events by name"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-2 focus:outline-offset-0 focus:outline-blue-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter events by status">
          {statusTabs.map((tab) => {
            const isActive = activeFilter === tab.value;
            const count =
              tab.value === "ALL"
                ? apiEvents.length
                : (statusCounts.get(tab.value) ?? 0);

            return (
              <button
                key={tab.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveFilter(tab.value)}
                className={[
                  "inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-[13px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
                  isActive
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/50 dark:hover:text-blue-300",
                ].join(" ")}
              >
                {tab.value !== "ALL" && (
                  <span
                    className={[
                      "h-1.5 w-1.5 rounded-full",
                      isActive ? "bg-white" : (chipDotColor[tab.value] ?? "bg-slate-400"),
                    ].join(" ")}
                  />
                )}
                {tab.label}
                <span
                  className={[
                    "rounded-full px-1.5 py-0.5 text-[10px] font-black tabular-nums leading-none",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                  ].join(" ")}
                >
                  {eventsQuery.isLoading ? "…" : count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {eventsQuery.isLoading && (
        <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <EventCardSkeleton key={index} />
          ))}
        </div>
      )}

      {eventsQuery.isError && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Failed to load events. Check coordinator event API/security.
        </div>
      )}

      {!eventsQuery.isLoading && !eventsQuery.isError && filteredEvents.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
            <CalendarMonthOutlinedIcon className="text-blue-500" />
          </div>

          <p className="mt-4 text-lg font-extrabold text-slate-900 dark:text-white">
            {search.trim() || activeFilter !== "ALL"
              ? "No events match your filters"
              : "No events yet"}
          </p>

          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {search.trim() || activeFilter !== "ALL"
              ? "Try a different search term or switch to another status filter."
              : "Create a new event to start setting up tracks and rounds."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/coordinator/events/create")}
            className="mt-6 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <AddOutlinedIcon sx={{ fontSize: 18 }} />
            Create New Event
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {filteredEvents.map((event) => {
          const eventId = getEventId(event);

          return (
            <EventManagementCard
              key={eventId}
              event={event}
              trackCount={getTrackCount(event, fetchedTrackCounts)}
              registeredTeamCount={getRegisteredTeamCount(event, fetchedTeamCounts)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default CoordinatorEventsPage;
