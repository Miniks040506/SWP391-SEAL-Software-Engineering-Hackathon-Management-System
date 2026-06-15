import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pagination } from "@mui/material";
import { eventApi } from "@/api/event.api";
import { trackApi } from "@/api/track.api";
import { useCoordinatorTeamsQuery } from "../hooks/useCoordinatorTeamQueries";
import { TeamFilterBar } from "../components/TeamFilterBar";
import { TeamTable } from "../components/TeamTable";
import { TeamDetailDrawer } from "../components/TeamDetailDrawer";
import { paginationSx } from "../schemas/teams.schema";
import type { CoordinatorTeamListParams } from "@/types/team.types";

const PAGE_SIZE = 20;

type EventOption = { id: string; name: string };
type TrackOption = { id: string; name: string; eventId: string };

export function CoordinatorTeamsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

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
        setFilters((prev) =>
          prev.eventId || eventOptions.length === 0
            ? prev
            : { ...prev, eventId: eventOptions[0].id, page: 1 },
        );
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

  const handleCloseDrawer = () => {
    navigate("/coordinator/teams");
  };

  const items = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300">
            Team Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor teams, members, tracks, and submission progress across events.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col overflow-hidden">
        <TeamFilterBar 
          filters={filters} 
          onChange={setFilters} 
          events={events}
          tracks={tracks}
        />

        <TeamTable teams={items} loading={loading} />

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 px-5 py-3 bg-white dark:bg-slate-800">
            <span className="text-xs text-slate-400">
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

      {teamId && (
        <TeamDetailDrawer
          teamId={teamId}
          onClose={handleCloseDrawer}
        />
      )}
    </div>
  );
}
