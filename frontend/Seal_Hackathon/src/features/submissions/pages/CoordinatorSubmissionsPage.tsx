import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, Pagination } from "@mui/material";
import { eventApi } from "@/api/event.api";
import { roundApi } from "@/api/round.api";
import { trackApi } from "@/api/track.api";
import { useCoordinatorSubmissionsQuery } from "../hooks/useCoordinatorSubmissionQueries";
import { SubmissionFilterBar } from "../components/SubmissionFilterBar";
import { SubmissionTable } from "../components/SubmissionTable";
import { SubmissionDetailDrawer } from "../components/SubmissionDetailDrawer";
import { paginationSx } from "../schemas/submissions.schema";
import type { CoordinatorSubmissionListParams } from "../hooks/useCoordinatorSubmissionQueries";

const PAGE_SIZE = 20;

type EventOption = { id: string; name: string };
type TrackOption = { id: string; name: string; eventId: string };
type RoundOption = { id: string; name: string; eventId: string };

export function CoordinatorSubmissionsPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

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

  const { data, loading, error, refetch } = useCoordinatorSubmissionsQuery(filters);

  const handleCloseDrawer = () => {
    navigate("/coordinator/submissions");
  };

  const items = useMemo(() => data?.content ?? [], [data?.content]);
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const progressSummary = useMemo(() => {
    const stats = {
      draft: 0,
      submitted: 0,
      late: 0,
      disqualified: 0,
      locked: 0,
      total: items.length,
    };
    items.forEach((sub) => {
      if (sub.roundSubmissionLocked) stats.locked += 1;
      if (sub.status === "DRAFT") stats.draft += 1;
      if (sub.status === "SUBMITTED") stats.submitted += 1;
      if (sub.status === "LATE") stats.late += 1;
      if (sub.status === "DISQUALIFIED") stats.disqualified += 1;
    });
    return stats;
  }, [items]);

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300">
            Submission Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor and review all team submissions across events, tracks, and
            rounds.
          </p>
        </div>
      </div>

      {error && (
        <Alert severity="error" className="mb-6">
          Unable to load submissions. Check the selected event, track, and round.
        </Alert>
      )}

      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 mb-6">
          <div className="flex items-center gap-2 pr-4 sm:border-r border-slate-200 dark:border-slate-700">
            <span className="text-sm font-bold text-slate-500">Finalized:</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">{progressSummary.submitted + progressSummary.late} / {progressSummary.total}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400"><span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>{progressSummary.draft} Draft Saved</span>
            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400"><span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>{progressSummary.submitted} Submitted</span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>{progressSummary.late} Late</span>
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400"><span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>{progressSummary.disqualified} Disqualified</span>
            <span className="text-slate-500 dark:text-slate-400">{progressSummary.locked} in locked rounds</span>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col overflow-hidden">
        <SubmissionFilterBar
          filters={filters}
          onChange={setFilters}
          events={events}
          tracks={tracks}
          rounds={rounds}
        />

        <SubmissionTable 
          submissions={items} 
          loading={loading} 
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 px-5 py-3 bg-white dark:bg-slate-800">
            <span className="text-xs text-slate-400">
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

      {submissionId && (
        <SubmissionDetailDrawer
          submissionId={submissionId}
          onClose={handleCloseDrawer}
          onRefresh={() => refetch()}
        />
      )}
    </div>
  );
}
