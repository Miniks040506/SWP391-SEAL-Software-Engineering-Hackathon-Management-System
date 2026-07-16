import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import StackedLineChartOutlinedIcon from "@mui/icons-material/StackedLineChartOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { Button, CircularProgress } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { UUID } from "@/types/common.types";
import type { EventSummaryResponse } from "@/types/event.types";

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
  | "ENDED"
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
  { label: "Completed", value: "COMPLETED" },
  { label: "Ended", value: "ENDED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Archived", value: "ARCHIVED" },
];

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

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "ONGOING"
      ? "border-blue-200 bg-blue-50 text-blue-600"
      : status === "REGISTRATION"
        ? "border-emerald-200 bg-emerald-50 text-emerald-600"
        : status === "DRAFT"
          ? "border-amber-200 bg-amber-50 text-amber-600"
          : status === "COMPLETED"
            ? "border-indigo-200 bg-indigo-50 text-indigo-600"
            : status === "CANCELLED"
              ? "border-rose-200 bg-rose-50 text-rose-600"
              : status === "ARCHIVED"
                ? "border-slate-200 bg-slate-50 text-slate-500"
              : "border-slate-200 bg-slate-50 text-slate-500";

  return (
    <span
      className={[
        "inline-flex rounded-lg border px-3 py-1 text-xs font-black tracking-[0.18em]",
        className,
      ].join(" ")}
    >
      {status}
    </span>
  );
}

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
  return `${start} - ${end}`;
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

  const eventId = getEventId(event);
  const name = getEventName(event);
  const status = getEventStatus(event);
  const season = getEventSeason(event);
  const bannerUrl = (event as EventCard).bannerUrl;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="aspect-21/9 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={name}
            className="h-full w-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-500 via-cyan-400 to-violet-600 text-sm font-black text-white">
            SEAL EVENT
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <StatusBadge status={status} />

          <span className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">
            {season}
          </span>
        </div>

        <h3 className="min-h-14 text-lg font-black leading-snug text-slate-950 dark:text-white">
          {name}
        </h3>

        <div className="my-5 h-px bg-slate-100 dark:bg-slate-800" />

        <div className="space-y-3 text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-3">
            <EventAvailableOutlinedIcon
              fontSize="small"
              className="text-slate-400"
            />

            <span>
              <b className="text-slate-950 dark:text-white">
                {formatCompetitionPeriod(event)}
              </b>{" "}
              Competition
            </span>
          </div>

          <div className="flex items-center gap-3">
            <StackedLineChartOutlinedIcon
              fontSize="small"
              className="text-slate-400"
            />

            <span>
              <b className="text-slate-950 dark:text-white">
                {trackCount ?? "—"}
              </b>{" "}
              Tracks
            </span>
          </div>

          <div className="flex items-center gap-3">
            <GroupsOutlinedIcon fontSize="small" className="text-slate-400" />

            <span>
              <b className="text-slate-950 dark:text-white">
                {registeredTeamCount ?? "—"}
              </b>{" "}
              Registered Teams
            </span>
          </div>
        </div>

        <div className="my-5 h-px bg-slate-100 dark:bg-slate-800" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            onClick={() => navigate(`/coordinator/events/${eventId}/edit`)}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 900,
            }}
          >
            Edit
          </Button>

          <Button
            variant="outlined"
            startIcon={<RemoveRedEyeOutlinedIcon />}
            onClick={() => navigate(`/coordinator/events/${eventId}/view`)}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 900,
            }}
          >
            View
          </Button>
        </div>
      </div>
    </article>
  );
}

export function CoordinatorEventsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<EventStatusFilter>("ALL");

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

  const filteredEvents = useMemo(() => {
    if (activeFilter === "ALL") return apiEvents;

    return apiEvents.filter((event) => {
      const status = getEventStatus(event);

      if (activeFilter === "ENDED") {
        return status === "ENDED" || status === "COMPLETED";
      }

      return status === activeFilter;
    });
  }, [activeFilter, apiEvents]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white">
            Event Management
          </h1>

          <p className="mt-2 text-base font-medium text-slate-500 dark:text-slate-400">
            Manage all hackathon events, timelines, tracks, and configurations.
          </p>
        </div>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => navigate("/coordinator/events/create")}
          sx={{
            bgcolor: "#2563eb",
            borderRadius: "12px",
            px: 3,
            py: 1.2,
            textTransform: "none",
            fontWeight: 900,
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          Create New Event
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveFilter(tab.value)}
              className={[
                "rounded-lg px-5 py-2 text-sm font-bold transition",
                activeFilter === tab.value
                  ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-300"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="ml-2 text-sm font-medium text-slate-400">
          {filteredEvents.length} event(s)
        </span>
      </div>

      {eventsQuery.isLoading && (
        <div className="flex justify-center py-20">
          <CircularProgress />
        </div>
      )}

      {eventsQuery.isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-600">
          Failed to load events. Check coordinator event API/security.
        </div>
      )}

      {!eventsQuery.isLoading && filteredEvents.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-lg font-black text-slate-700 dark:text-white">
            No events found.
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Create a new event to start setting up tracks and rounds.
          </p>
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
