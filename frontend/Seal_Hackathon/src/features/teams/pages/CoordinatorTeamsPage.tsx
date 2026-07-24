import { useState, useEffect } from "react";
import { Pagination } from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HourglassTopOutlinedIcon from "@mui/icons-material/HourglassTopOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { eventApi } from "@/api/event.api";
import { trackApi } from "@/api/track.api";
import { useCoordinatorTeamsQuery } from "../hooks/useCoordinatorTeamQueries";
import { usePendingTeamApprovalCounts } from "../hooks/usePendingTeamApprovalCounts";
import { useCountUp } from "../hooks/useCountUp";
import { TeamFilterBar } from "../components/TeamFilterBar";
import { TeamTable } from "../components/TeamTable";
import { paginationSx } from "../schemas/teams.schema";
import type { CoordinatorTeamListParams } from "@/types/team.types";
import "../styles/teamsList.css";

const PAGE_SIZE = 20;

type EventOption = { id: string; name: string };
type TrackOption = { id: string; name: string; eventId: string };

type Tone = "blue" | "amber" | "slate";

const toneMap: Record<
  Tone,
  { value: string; icon: string; accent: string }
> = {
  blue: {
    value: "text-blue-600 dark:text-blue-400",
    icon: "text-blue-500 dark:text-blue-400",
    accent: "bg-blue-500",
  },
  amber: {
    value: "text-amber-600 dark:text-amber-300",
    icon: "text-amber-500 dark:text-amber-400",
    accent: "bg-amber-400",
  },
  slate: {
    value: "text-slate-900 dark:text-slate-100",
    icon: "text-slate-400 dark:text-slate-500",
    accent: "bg-slate-300 dark:bg-slate-600",
  },
};

function StatTile({
  label,
  value,
  tone,
  icon,
  delayMs,
  hint,
  active,
  onClick,
}: {
  label: string;
  value: number;
  tone: Tone;
  icon: React.ReactNode;
  delayMs: number;
  hint?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const animated = useCountUp(value);
  const styles = toneMap[tone];
  const clickable = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={[
        "tl-rise tl-card relative overflow-hidden rounded-2xl border bg-white px-4 py-3.5 text-left dark:bg-slate-900/60",
        active
          ? "border-amber-300 dark:border-amber-500/40"
          : "border-slate-200 dark:border-slate-800",
        clickable ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span className={styles.icon}>{icon}</span>
      </div>
      <div className={`mt-1.5 text-3xl font-bold leading-none tabular-nums ${styles.value}`}>
        {Math.round(animated)}
      </div>
      {hint && (
        <div className="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {hint}
        </div>
      )}
      <span
        className={`tl-underline absolute bottom-0 left-0 h-[3px] w-full ${styles.accent}`}
        style={{ animationDelay: `${delayMs + 140}ms` }}
      />
    </button>
  );
}

export function CoordinatorTeamsPage() {
  const [filters, setFilters] = useState<CoordinatorTeamListParams>({
    page: 1,
    size: PAGE_SIZE,
  });

  const [events, setEvents] = useState<EventOption[]>([]);
  const [tracks, setTracks] = useState<TrackOption[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRes = await eventApi.getAllEvents({ page: 0, size: 100 });
        const eventOptions = eventsRes.content.map((event) => ({
          id: event.id,
          name: event.name,
        }));
        setEvents(eventOptions);
      } catch {
        // Silently handle error
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchTracks = async () => {
      if (!filters.eventId) {
        setTracks([]);
        return;
      }
      try {
        const tracksRes = await trackApi.getTracksByEvent(filters.eventId);
        setTracks(
          tracksRes.map((track) => ({
            id: track.id,
            name: track.name,
            eventId: filters.eventId!,
          }))
        );
      } catch {
        // Silently handle error
      }
    };
    fetchTracks();
  }, [filters.eventId]);

  const { data, loading } = useCoordinatorTeamsQuery(filters);
  const { countsByEventId: pendingCountsByEvent, totalCount: pendingTotal } =
    usePendingTeamApprovalCounts();

  const items = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const isPendingFilterActive =
    filters.registrationStatus === "PENDING_APPROVAL";
  const hasPending = pendingTotal > 0;

  const reviewPending = () =>
    setFilters((f) => ({
      ...f,
      registrationStatus: isPendingFilterActive ? undefined : "PENDING_APPROVAL",
      page: 1,
    }));

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] bg-slate-50 p-6 dark:bg-transparent">
      {/* Header */}
      <div className="tl-fade mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Team Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor teams, members, tracks, and submission progress across
            events.
          </p>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatTile
          label={filters.eventId ? "Teams (event)" : "Total teams"}
          value={total}
          tone="blue"
          icon={<GroupsOutlinedIcon sx={{ fontSize: 18 }} />}
          delayMs={40}
        />
        <StatTile
          label="Pending approval"
          value={pendingTotal}
          tone={hasPending ? "amber" : "slate"}
          icon={<HourglassTopOutlinedIcon sx={{ fontSize: 18 }} />}
          delayMs={90}
          hint={
            hasPending
              ? isPendingFilterActive
                ? "Filtering pending"
                : "Click to review"
              : "All clear"
          }
          active={isPendingFilterActive}
          onClick={hasPending ? reviewPending : undefined}
        />
        <StatTile
          label="Events"
          value={events.length}
          tone="slate"
          icon={<EventOutlinedIcon sx={{ fontSize: 18 }} />}
          delayMs={140}
        />
      </div>

      {/* Actionable pending banner */}
      {hasPending && !isPendingFilterActive && (
        <button
          type="button"
          onClick={reviewPending}
          className="tl-rise group mb-5 flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left transition-colors hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:hover:bg-amber-500/15"
        >
          <span className="tl-pulse flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
            <HourglassTopOutlinedIcon sx={{ fontSize: 18 }} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
              {pendingTotal} team{pendingTotal > 1 ? "s" : ""} awaiting your
              approval
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
              Review registrations so these teams can start competing.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white transition-transform group-hover:translate-x-0.5">
            Review now <ArrowForwardIcon sx={{ fontSize: 15 }} />
          </span>
        </button>
      )}

      {/* Filters + table card */}
      <div className="tl-rise flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60" style={{ animationDelay: "80ms" }}>
        <TeamFilterBar
          filters={filters}
          onChange={setFilters}
          events={events}
          tracks={tracks}
          pendingCountsByEvent={pendingCountsByEvent}
        />

        <TeamTable teams={items} loading={loading} />

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-400">
              Showing {(filters.page! - 1) * filters.size! + 1}–
              {Math.min(filters.page! * filters.size!, total)} of {total} teams
            </span>
            <Pagination
              count={totalPages}
              page={filters.page}
              onChange={(_, p) => setFilters({ ...filters, page: p })}
              size="small"
              shape="rounded"
              variant="outlined"
              sx={paginationSx}
            />
          </div>
        )}
      </div>
    </div>
  );
}
