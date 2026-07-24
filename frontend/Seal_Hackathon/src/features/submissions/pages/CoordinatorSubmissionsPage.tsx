import { useState, useEffect, useMemo } from "react";
import { Alert, Pagination } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { eventApi } from "@/api/event.api";
import { roundApi } from "@/api/round.api";
import { trackApi } from "@/api/track.api";
import { useCoordinatorSubmissionsQuery } from "../hooks/useCoordinatorSubmissionQueries";
import { useCountUp } from "../hooks/useCountUp";
import { SubmissionFilterBar } from "../components/SubmissionFilterBar";
import { SubmissionTable } from "../components/SubmissionTable";
import { paginationSx } from "../schemas/submissions.schema";
import type { CoordinatorSubmissionListParams } from "../hooks/useCoordinatorSubmissionQueries";
import "../styles/submissionsList.css";

const PAGE_SIZE = 20;

type EventOption = { id: string; name: string };
type TrackOption = { id: string; name: string; eventId: string };
type RoundOption = { id: string; name: string; eventId: string };

type Tone = "slate" | "emerald" | "amber" | "blue" | "red";

const toneMap: Record<Tone, { value: string; icon: string; accent: string }> = {
  slate: { value: "text-slate-900 dark:text-slate-100", icon: "text-slate-400 dark:text-slate-500", accent: "bg-slate-300 dark:bg-slate-600" },
  emerald: { value: "text-emerald-600 dark:text-emerald-400", icon: "text-emerald-500 dark:text-emerald-400", accent: "bg-emerald-500" },
  amber: { value: "text-amber-600 dark:text-amber-300", icon: "text-amber-500 dark:text-amber-400", accent: "bg-amber-400" },
  blue: { value: "text-blue-600 dark:text-blue-400", icon: "text-blue-500 dark:text-blue-400", accent: "bg-blue-500" },
  red: { value: "text-red-600 dark:text-red-400", icon: "text-red-500 dark:text-red-400", accent: "bg-red-500" },
};

function StatTile({
  label,
  value,
  tone,
  icon,
  delayMs,
}: {
  label: string;
  value: number;
  tone: Tone;
  icon: React.ReactNode;
  delayMs: number;
}) {
  const animated = useCountUp(value);
  const styles = toneMap[tone];
  return (
    <div
      className="sl-rise sl-card relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/60"
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
      <span
        className={`sl-underline absolute bottom-0 left-0 h-[3px] w-full ${styles.accent}`}
        style={{ animationDelay: `${delayMs + 140}ms` }}
      />
    </div>
  );
}

export function CoordinatorSubmissionsPage() {
  const [filters, setFilters] = useState<CoordinatorSubmissionListParams>({
    page: 1,
    size: PAGE_SIZE,
  });

  const [events, setEvents] = useState<EventOption[]>([]);
  const [tracks, setTracks] = useState<TrackOption[]>([]);
  const [rounds, setRounds] = useState<RoundOption[]>([]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const eventsRes = await eventApi.getAllEvents({ page: 0, size: 100 });
        const eventOptions = eventsRes.content.map((event) => ({
          id: event.id,
          name: event.name,
        }));

        const [trackGroups, roundGroups] = await Promise.all([
          Promise.all(
            eventOptions.map((event) =>
              trackApi.getTracksByEvent(event.id).then((tracks) =>
                tracks.map((track) => ({
                  id: track.id,
                  name: track.name,
                  eventId: event.id,
                })),
              ),
            ),
          ),
          Promise.all(
            eventOptions.map((event) =>
              roundApi.getRoundsByEvent(event.id).then((rounds) =>
                rounds.map((round) => ({
                  id: round.id,
                  name: round.name,
                  eventId: event.id,
                })),
              ),
            ),
          ),
        ]);

        setEvents(eventOptions);
        setTracks(trackGroups.flat());
        setRounds(roundGroups.flat());
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  const { data, summary, loading, error } =
    useCoordinatorSubmissionsQuery(filters);

  const items = useMemo(() => data?.content ?? [], [data?.content]);
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const finalized = summary ? summary.submitted + summary.late : 0;
  const finalizedPct =
    summary && summary.total > 0
      ? Math.round((finalized / summary.total) * 100)
      : 0;

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] bg-slate-50 p-6 dark:bg-transparent">
      {/* Header */}
      <div className="sl-fade mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Submission Management
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor and review all team submissions across events, tracks, and
          rounds.
        </p>
      </div>

      {error && (
        <Alert severity="error" className="mb-6">
          Unable to load submissions. Check the selected event, track, and round.
        </Alert>
      )}

      {/* KPI tiles */}
      {summary && (
        <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile
            label="Total"
            value={summary.total}
            tone="slate"
            icon={<Inventory2OutlinedIcon sx={{ fontSize: 18 }} />}
            delayMs={40}
          />
          <StatTile
            label="Submitted"
            value={summary.submitted}
            tone="emerald"
            icon={<CheckCircleOutlineIcon sx={{ fontSize: 18 }} />}
            delayMs={80}
          />
          <StatTile
            label="Late"
            value={summary.late}
            tone="amber"
            icon={<ScheduleOutlinedIcon sx={{ fontSize: 18 }} />}
            delayMs={120}
          />
          <StatTile
            label="Draft"
            value={summary.draft}
            tone="blue"
            icon={<EditNoteOutlinedIcon sx={{ fontSize: 18 }} />}
            delayMs={160}
          />
          <StatTile
            label="Disqualified"
            value={summary.disqualified}
            tone="red"
            icon={<GavelOutlinedIcon sx={{ fontSize: 18 }} />}
            delayMs={200}
          />
        </div>
      )}

      {/* Finalization progress — grading readiness at a glance */}
      {summary && summary.total > 0 && (
        <div
          className="sl-rise mb-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60"
          style={{ animationDelay: "120ms" }}
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Finalized submissions
              </span>
              <span className="text-sm font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                {finalized} / {summary.total}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {summary.locked > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <LockOutlinedIcon sx={{ fontSize: 14 }} />
                  {summary.locked} in locked rounds
                </span>
              )}
              <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {finalizedPct}%
              </span>
            </div>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="sl-bar h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              style={{ ["--sl-fill" as string]: `${finalizedPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Filters + table card */}
      <div className="sl-rise flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60" style={{ animationDelay: "160ms" }}>
        <SubmissionFilterBar
          filters={filters}
          onChange={setFilters}
          events={events}
          tracks={tracks}
          rounds={rounds}
        />

        <SubmissionTable submissions={items} loading={loading} />

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-400">
              Showing {(filters.page! - 1) * filters.size! + 1}–
              {Math.min(filters.page! * filters.size!, total)} of {total}{" "}
              submissions
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
