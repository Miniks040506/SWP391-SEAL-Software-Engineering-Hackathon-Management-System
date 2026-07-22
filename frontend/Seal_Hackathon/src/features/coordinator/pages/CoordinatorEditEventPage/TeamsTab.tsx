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

import { TabShell } from "./TabShell";

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((prev) => ({
      ...prev,
      eventId,
      trackId: undefined,
      page: 1,
    }));
    setSelectedTeamId(null);
  }, [eventId]);

  const { data, loading, refetch } = useCoordinatorTeamsQuery(filters);
  const items = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const trackOptions = tracks.map((track) => ({
    id: track.id,
    name: track.name,
    eventId,
  }));

  const handleFiltersChange = (next: CoordinatorTeamListParams) => {
    setFilters({ ...next, eventId });
  };

  return (
    <TabShell
      tab="TEAMS"
      title="Registered Teams"
      description={`Review every team registered for ${eventName}. Open a team to inspect members and status.`}
      bodyClassName="p-0"
    >
      <TeamFilterBar
        filters={filters}
        onChange={handleFiltersChange}
        events={[{ id: eventId, name: eventName }]}
        tracks={trackOptions}
      />

      <TeamTable
        teams={items}
        loading={loading}
        onViewTeam={(teamId) => setSelectedTeamId(teamId)}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400">
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
          onChanged={refetch}
        />
      )}
    </TabShell>
  );
};
