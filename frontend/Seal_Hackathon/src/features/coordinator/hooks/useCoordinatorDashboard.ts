import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { teamApi } from "@/api/team.api";
import { submissionApi } from "@/api/submission.api";
import { roundApi } from "@/api/round.api";
import { notificationApi } from "@/api/notification.api";

import {
  useCoordinatorEventsQuery,
  useCoordinatorEventDetailQuery,
  useCoordinatorEventRoundsQuery,
} from "./useCoordinatorEventQueries";

import type { EventSummaryResponse } from "@/types/event.types";
import type { SummaryCardType } from "../components/dashboard/DashboardSummaryCards";
import type { PendingActionType } from "../components/dashboard/DashboardPendingActions";
import type { RecentActivityType } from "../components/dashboard/DashboardRecentActivity";
import type { ResultStatusType } from "../components/dashboard/DashboardResultStatus";
import type { DashboardEvent } from "../components/dashboard/DashboardCurrentEvent";

import { mockCoordinatorDashboard } from "../mocks/coordinatorDashboard.mock";

const USE_MOCK = false;

export function useCoordinatorDashboard() {
  const eventsQuery = useCoordinatorEventsQuery({ page: 0, size: 100 });
  const apiEvents = (eventsQuery.data?.content ?? (eventsQuery.data as any)?.data?.content ?? []) as EventSummaryResponse[];

  const activeEvents = useMemo(
    () => apiEvents.filter((e) => ["ONGOING", "REGISTRATION"].includes((e.status || "").trim().toUpperCase())),
    [apiEvents]
  );

  const currentEventSummary = useMemo(() => {
    const ongoing = apiEvents.find((e) => (e.status || "").trim().toUpperCase() === "ONGOING");
    const registration = apiEvents.find((e) => (e.status || "").trim().toUpperCase() === "REGISTRATION");
    return ongoing ?? registration ?? apiEvents[0] ?? null;
  }, [apiEvents]);

  const currentEventId = currentEventSummary?.id;
  const currentEventDetailQuery = useCoordinatorEventDetailQuery(currentEventId);
  const currentEvent = (currentEventDetailQuery.data ?? currentEventSummary ?? null) as DashboardEvent | null;

  const roundsQuery = useCoordinatorEventRoundsQuery(currentEventId);
  const rounds = roundsQuery.data || [];
  const currentRound = rounds[rounds.length - 1]; // Lấy round cuối

  const teamsQuery = useQuery({
    queryKey: ["coord-dashboard-teams", currentEventId],
    queryFn: () => teamApi.getCoordinatorEventTeams(currentEventId!, { page: 0, size: 1000 }),
    enabled: Boolean(currentEventId) && !USE_MOCK,
  });

  const submissionsQuery = useQuery({
    queryKey: ["coord-dashboard-submissions", currentEventId],
    queryFn: () => submissionApi.getEventSubmissions({ eventId: currentEventId } as any),
    enabled: Boolean(currentEventId) && !USE_MOCK,
  });

  const scoringQuery = useQuery({
    queryKey: ["coord-dashboard-scoring", currentRound?.id],
    queryFn: () => roundApi.getScoringProgress(currentRound!.id),
    enabled: Boolean(currentRound?.id) && !USE_MOCK,
    retry: false,
  });

  const notifsQuery = useQuery({
    queryKey: ["coord-dashboard-notifs"],
    queryFn: () => notificationApi.getMyNotifications({ page: 0, size: 5 }),
    enabled: !USE_MOCK,
  });

  const isEventError = eventsQuery.isError;
  const isEventLoading = eventsQuery.isLoading || currentEventDetailQuery.isLoading;
  const isWidgetsLoading = !USE_MOCK && (teamsQuery.isLoading || submissionsQuery.isLoading || notifsQuery.isLoading);

  const summaryCards: SummaryCardType[] = useMemo(() => {
    if (USE_MOCK) return mockCoordinatorDashboard.summaryCards;

    const teamsList = teamsQuery.data?.content ?? [];
    const registeredTeamsCount = teamsList.filter(
      (t) => ["REGISTERED", "COMPETING", "ADVANCED", "WINNER"].includes((t.status ?? "").toUpperCase())
    ).length;
    const totalSubmissions = submissionsQuery.data?.totalElements ?? 0;
    const draftScorecards = (scoringQuery.data as any)?.draftCount ?? 0;

    return [
      { title: "Active Events", value: activeEvents.length, description: "Currently running or registration open", iconType: "event", color: "bg-blue-50 text-blue-600" },
      { title: "Registered Teams", value: registeredTeamsCount, description: "Teams registered for this event", iconType: "team", color: "bg-orange-50 text-orange-600" },
      { title: "Submissions", value: totalSubmissions, description: "Total submissions received", iconType: "submission", color: "bg-purple-50 text-purple-600" },
      { title: "Draft Scorecards", value: draftScorecards, description: "Need judge completion", iconType: "grading", color: "bg-rose-50 text-rose-600" },
    ];
  }, [USE_MOCK, activeEvents.length, teamsQuery.data, submissionsQuery.data, scoringQuery.data]);

  const pendingActions: PendingActionType[] = useMemo(() => {
    if (USE_MOCK) return mockCoordinatorDashboard.pendingActions;

    const actions: PendingActionType[] = [];
    const teamsList = teamsQuery.data?.content ?? [];
    const formingTeamsCount = teamsList.filter(
      (t) => (t.status ?? "").toUpperCase() === "FORMING"
    ).length;
    const draftScorecards = (scoringQuery.data as any)?.draftCount ?? 0;

    if (formingTeamsCount > 0) {
      actions.push({
        id: "pa-teams",
        title: `${formingTeamsCount} team${formingTeamsCount > 1 ? "s" : ""} still forming — not yet registered`,
        description: "These teams haven't completed registration. Remind participants to register their team.",
        actionLabel: "View Teams",
        path: "/coordinator/teams",
        priority: "High",
      });
    }
    if (draftScorecards > 0) {
      actions.push({
        id: "pa-score",
        title: `${draftScorecards} scorecards are still in Draft`,
        description: "Check grading progress before locking round grading.",
        actionLabel: "View Grading",
        path: "/coordinator/judging",
        priority: "Medium",
      });
    }
    if (actions.length === 0 && currentEventId) {
      actions.push({
        id: "pa-ok",
        title: "All caught up!",
        description: "No urgent actions required. You can review event settings.",
        actionLabel: "View Event",
        path: `/coordinator/events/${currentEventId}/edit`,
        priority: "Low",
      });
    }
    return actions;
  }, [USE_MOCK, teamsQuery.data, scoringQuery.data, currentEventId]);

  const recentActivities: RecentActivityType[] = useMemo(() => {
    if (USE_MOCK) return mockCoordinatorDashboard.recentActivities;

    const normalizeText = (text: string | null | undefined): string => {
      if (!text) return "";
      return text
        .replace(/approved teams?/gi, "registered team")
        .replace(/team registration approved/gi, "Team registered")
        .replace(/team registrations? (?:are )?waiting for approval/gi, "teams still forming — not yet registered");
    };

    const notifsList = notifsQuery.data?.content ?? [];
    return notifsList.slice(0, 4).map((n: any) => ({
      id: n.id,
      time: new Date(n.sentAt || n.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
      title: normalizeText(n.title),
      description: normalizeText(n.body),
    }));
  }, [USE_MOCK, notifsQuery.data]);

  const resultStatus: ResultStatusType = useMemo(() => {
    if (USE_MOCK) return mockCoordinatorDashboard.resultStatus;

    return {
      round: currentRound?.name || "No Active Round",
      rankingCalculated: currentRound?.status === "CLOSED" ? 100 : 0,
      awardsAssigned: 0,
      published: 0,
    };
  }, [USE_MOCK, currentRound]);

  return {
    isEventError,
    isEventLoading,
    isWidgetsLoading,
    currentEvent,
    summaryCards,
    resultStatus,
    pendingActions,
    recentActivities,
  };
}