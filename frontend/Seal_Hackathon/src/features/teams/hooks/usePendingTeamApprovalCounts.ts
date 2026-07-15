import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";

import { eventApi } from "@/api/event.api";
import { teamApi } from "@/api/team.api";
import type { EventSummaryResponse } from "@/types/event.types";

/**
 * Fetches the number of teams with registrationStatus === "PENDING_APPROVAL"
 * for every event the coordinator manages.
 *
 * Returns:
 * - `totalCount` — aggregate across all events (for sidebar badge)
 * - `countsByEventId` — per-event map (for dropdown badges)
 */
export function usePendingTeamApprovalCounts(enabled = true) {
  const eventsQuery = useQuery({
    queryKey: ["pending-team-approval-events"],
    queryFn: () => eventApi.getAllEvents({ page: 0, size: 100 }),
    staleTime: 120_000,
    enabled,
  });

  const eventIds = useMemo(() => {
    const raw = eventsQuery.data?.content ?? [];
    return (raw as EventSummaryResponse[]).map((e) => e.id);
  }, [eventsQuery.data]);

  const pendingQueries = useQueries({
    queries: eventIds.map((eventId) => ({
      queryKey: ["pending-team-approval-count", eventId],
      queryFn: () =>
        teamApi.getCoordinatorEventTeams(eventId, {
          registrationStatus: "PENDING_APPROVAL",
          page: 0,
          size: 1,
        }),
      enabled: enabled && eventIds.length > 0,
      staleTime: 60_000,
      refetchInterval: 60_000,
    })),
  });

  const countsByEventId = useMemo(() => {
    const map: Record<string, number> = {};
    eventIds.forEach((id, index) => {
      const result = pendingQueries[index];
      map[id] = result?.data?.totalElements ?? 0;
    });
    return map;
  }, [eventIds, pendingQueries]);

  const totalCount = useMemo(
    () => Object.values(countsByEventId).reduce((sum, n) => sum + n, 0),
    [countsByEventId],
  );

  return {
    totalCount,
    countsByEventId,
    isLoading: eventsQuery.isLoading || pendingQueries.some((q) => q.isLoading),
  };
}
