import { useMemo } from "react";

import { useCoordinatorEventDetailQuery, useCoordinatorEventsQuery } from "../hooks/useCoordinatorEventQueries";
import {
  coordinatorPendingActions,
  coordinatorRecentActivities,
  coordinatorResultStatus,
  coordinatorSummaryCards,
} from "../mocks/coordinatorDashboard.mock";

import type { EventSummaryResponse } from "@/types/event.types";

import { DashboardWelcomeBanner } from "../components/dashboard/DashboardWelcomeBanner";
import { DashboardSummaryCards } from "../components/dashboard/DashboardSummaryCards";
import { DashboardCurrentEvent, type DashboardEvent } from "../components/dashboard/DashboardCurrentEvent";
import { DashboardResultStatus } from "../components/dashboard/DashboardResultStatus";
import { DashboardPendingActions } from "../components/dashboard/DashboardPendingActions";
import { DashboardRecentActivity } from "../components/dashboard/DashboardRecentActivity";

export const CoordinatorDashboardPage = () => {
  const eventsQuery = useCoordinatorEventsQuery({ page: 0, size: 100 });
  const apiEvents = (eventsQuery.data?.content ?? []) as EventSummaryResponse[];

  const activeEvents = useMemo(
    () => apiEvents.filter((event) => ["ONGOING", "REGISTRATION"].includes((event.status || "").trim().toUpperCase())),
    [apiEvents]
  );

  const currentEventSummary = useMemo(() => {
    const ongoingEvent = apiEvents.find((event) => (event.status || "").trim().toUpperCase() === "ONGOING");
    const registrationEvent = apiEvents.find((event) => (event.status || "").trim().toUpperCase() === "REGISTRATION");
    return ongoingEvent ?? registrationEvent ?? apiEvents[0] ?? null;
  }, [apiEvents]);

  const currentEventDetailQuery = useCoordinatorEventDetailQuery(currentEventSummary?.id);
  const currentEvent = (currentEventDetailQuery.data ?? currentEventSummary ?? null) as DashboardEvent | null;

  const summaryCards = useMemo(() => {
    return coordinatorSummaryCards.map((card: any) => {
      if (card.title !== "Active Events") return card;
      return { ...card, value: activeEvents.length, description: "Currently running or registration open" };
    });
  }, [activeEvents.length]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DashboardWelcomeBanner />

      {eventsQuery.isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-bold text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Cannot load event dashboard data from API. Please check backend, endpoint, token, or security config.
        </div>
      )}

      <DashboardSummaryCards cards={summaryCards} isLoading={eventsQuery.isLoading} />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <DashboardCurrentEvent 
          event={currentEvent} 
          isLoading={eventsQuery.isLoading || currentEventDetailQuery.isLoading} 
        />
        <DashboardResultStatus status={coordinatorResultStatus} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashboardPendingActions actions={coordinatorPendingActions as any} />
        <DashboardRecentActivity activities={coordinatorRecentActivities as any} />
      </section>
    </div>
  );
};

export default CoordinatorDashboardPage;