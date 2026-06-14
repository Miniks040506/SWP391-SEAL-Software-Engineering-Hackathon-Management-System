import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pagination } from "@mui/material";
import { eventApi } from "@/api/event.api";
import { roundApi } from "@/api/round.api";
import { trackApi } from "@/api/track.api";
import { teamApi } from "@/api/team.api";
import type { UUID } from "@/types/common.types";
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

  const { data, loading } = useCoordinatorSubmissionsQuery(filters);

  const [projectTitles, setProjectTitles] = useState<Record<UUID, string>>({});

  useEffect(() => {
    if (!data?.content || data.content.length === 0) {
      setProjectTitles({});
      return;
    }

    const fetchTitles = async () => {
      try {
        const uniqueTeamIds = Array.from(new Set(data.content.map((s) => s.teamId)));
        
        const promises = uniqueTeamIds.map(id => teamApi.getTeamById(id));
        const results = await Promise.all(promises);

        const newMap: Record<UUID, string> = {};
        results.forEach((team) => {
          if (team.projectTitle) {
            newMap[team.id] = team.projectTitle;
          }
        });

        setProjectTitles(newMap);
      } catch (error) {
        console.error("Failed to fetch project titles:", error);
      }
    };

    fetchTitles();
  }, [data?.content]);

  const handleCloseDrawer = () => {
    navigate("/coordinator/submissions");
  };

  const items = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

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
          projectTitles={projectTitles} 
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
        />
      )}
    </div>
  );
}
