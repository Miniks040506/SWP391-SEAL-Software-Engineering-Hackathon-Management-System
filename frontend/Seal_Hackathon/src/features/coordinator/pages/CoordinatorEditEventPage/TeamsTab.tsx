import { useEffect, useState } from "react";
import { Pagination } from "@mui/material";

import { TeamDetailDrawer } from "@/features/teams/components/TeamDetailDrawer";
import { TeamFilterBar } from "@/features/teams/components/TeamFilterBar";
import { TeamTable } from "@/features/teams/components/TeamTable";
import { useCoordinatorTeamsQuery } from "@/features/teams/hooks/useCoordinatorTeamQueries";
import { paginationSx } from "@/features/teams/schemas/teams.schema";
import type { UUID } from "@/types/common.types";
import type { CoordinatorTeamListParams } from "@/types/team.types";
import type { TrackResponse } from "@/types/track.types";

const PAGE_SIZE = 20;

type TeamsTabProps = {
  eventId: UUID;
  eventName: string;
  tracks: TrackResponse[];
};

export const TeamsTab = ({ eventId, eventName, tracks }: TeamsTabProps) => {
  const [selectedTeamId, setSelectedTeamId] = useState<UUID | null>(null);
  const [filters, setFilters] = useState<CoordinatorTeamListParams>({
    eventId,
    page: 1,
    size: PAGE_SIZE,
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      eventId,
      trackId: undefined,
      page: 1,
    }));
    setSelectedTeamId(null);
  }, [eventId]);

  const { data, loading } = useCoordinatorTeamsQuery(filters);
  const items = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const trackOptions = tracks.map((track) => ({
    id: track.id,
    name: track.name,
    eventId,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <TeamFilterBar
        filters={filters}
        onChange={setFilters}
        events={[{ id: eventId, name: eventName }]}
        tracks={trackOptions}
      />

      <TeamTable
        teams={items}
        loading={loading}
        onViewTeam={(teamId) => setSelectedTeamId(teamId)}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-3 dark:border-slate-700 dark:bg-slate-900">
          <span className="text-xs text-slate-400">
            Showing {(filters.page! - 1) * filters.size! + 1}-
            {Math.min(filters.page! * filters.size!, total)} of {total} teams
          </span>
          <Pagination
            count={totalPages}
            page={filters.page}
            onChange={(_, page) => setFilters({ ...filters, page })}
            size="small"
            shape="rounded"
            variant="outlined"
            sx={paginationSx}
          />
        </div>
      )}

      {selectedTeamId && (
        <TeamDetailDrawer
          teamId={selectedTeamId}
          onClose={() => setSelectedTeamId(null)}
        />
      )}
    </div>
  );
};
