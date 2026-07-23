import { Navigate } from "react-router-dom";

import { useCoordinatorEventsQuery } from "@/features/coordinator/hooks/useCoordinatorEventQueries";
import type { EventSummaryResponse } from "@/types/event.types";

const RESULT_EVENT_STATUSES = [
  "ONGOING",
  "JUDGING",
  "PUBLISHED",
  "COMPLETED",
];

export const CoordinatorResultsRedirectPage = () => {
  const { data, isLoading } = useCoordinatorEventsQuery({ page: 0, size: 100 });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 motion-reduce:animate-none" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 motion-reduce:animate-none" />
      </div>
    );
  }

  const events = (data?.content ?? []) as EventSummaryResponse[];
  const event =
    events.find((candidate) =>
      RESULT_EVENT_STATUSES.includes(candidate.status.toUpperCase()),
    ) ?? events[0];

  return event ? (
    <Navigate
      to={`/coordinator/events/${event.id}/rankings`}
      replace
    />
  ) : (
    <Navigate to="/coordinator/events" replace />
  );
};
