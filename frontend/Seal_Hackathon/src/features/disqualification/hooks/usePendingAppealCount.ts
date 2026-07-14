import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { eventApi } from "@/api/event.api";
import { disqualificationApi } from "@/api/disqualification.api";
import type { EventSummaryResponse } from "@/types/event.types";

/**
 * Fetches the number of disqualifications with appealStatus === "PENDING"
 * for the current (most relevant) event.
 *
 * "Current event" is resolved as: first ONGOING → first REGISTRATION → first event.
 * Auto-refreshes every 60 seconds.
 */
export function usePendingAppealCount(enabled = true) {
  const eventsQuery = useQuery({
    queryKey: ["pending-appeal-events"],
    queryFn: () => eventApi.getAllEvents({ page: 0, size: 100 }),
    staleTime: 120_000,
    enabled,
  });

  const apiEvents = useMemo(() => {
    const raw = eventsQuery.data?.content ?? [];
    return raw as EventSummaryResponse[];
  }, [eventsQuery.data]);

  const currentEventId = useMemo(() => {
    const ongoing = apiEvents.find(
      (e) => (e.status || "").trim().toUpperCase() === "ONGOING",
    );
    const registration = apiEvents.find(
      (e) => (e.status || "").trim().toUpperCase() === "REGISTRATION",
    );
    return (ongoing ?? registration ?? apiEvents[0])?.id ?? null;
  }, [apiEvents]);

  const pendingQuery = useQuery({
    queryKey: ["pending-appeal-count", currentEventId],
    queryFn: () =>
      disqualificationApi.getEventDisqualifications(currentEventId!, {
        appealStatus: "PENDING",
      }),
    enabled: enabled && Boolean(currentEventId),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const count = pendingQuery.data?.length ?? 0;

  return { count, isLoading: eventsQuery.isLoading || pendingQuery.isLoading };
}
