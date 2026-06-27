import { useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { userApi } from "@/api/user.api";
import { eventApi } from "@/api/event.api";
import { roundApi } from "@/api/round.api";
import { notificationApi } from "@/api/notification.api";
import { calibrationApi } from "@/api/calibration.api";

import { judgeDashboardMock, type JudgeDashboardData } from "../mocks/judgeDashboard.mock";

const USE_MOCK = false;

export function useJudgeDashboard() {
  const navigate = useNavigate();

  const profileQuery = useQuery({
    queryKey: ["judge-profile"],
    queryFn: () => userApi.getMyProfile(),
    enabled: !USE_MOCK,
  });

  const eventsQuery = useQuery({
    queryKey: ["judge-events"],
    queryFn: () => eventApi.getPublicEvents({ page: 0, size: 100 }),
    enabled: !USE_MOCK,
  });

  const myUserId = profileQuery.data?.id;
  const apiEvents = eventsQuery.data?.content || (eventsQuery.data as any)?.data?.content || [];
  const activeEvent = apiEvents.find((e: any) => ["ONGOING", "REGISTRATION"].includes((e.status || "").toUpperCase())) || apiEvents[0];

  const roundsQuery = useQuery({
    queryKey: ["judge-rounds", activeEvent?.id],
    queryFn: () => roundApi.getRoundsByEvent(activeEvent!.id),
    enabled: !USE_MOCK && Boolean(activeEvent?.id),
  });
  const rounds = roundsQuery.data || [];

  const calibrationsQuery = useQuery({
    queryKey: ["judge-calibrations", activeEvent?.id],
    queryFn: () => calibrationApi.getCalibrationRoundsByEvent(activeEvent!.id),
    enabled: !USE_MOCK && Boolean(activeEvent?.id),
  });

  const assignmentsQueries = useQueries({
    queries: rounds.map((round) => ({
      queryKey: ["judge-assignments", round.id],
      queryFn: () => roundApi.getJudgeAssignments(round.id),
      enabled: !USE_MOCK && Boolean(round.id),
    })),
  });

  const myAssignments = useMemo(() => {
    if (USE_MOCK || !myUserId) return [];
    const found: any[] = [];
    for (let i = 0; i < rounds.length; i++) {
      const judgesInRound = assignmentsQueries[i].data || [];
      const myTask = judgesInRound.find((j) => j.judgeId === myUserId);
      if (myTask) {
        found.push({ ...myTask, roundName: rounds[i].name, judgingDeadline: rounds[i].judgingDeadline });
      }
    }
    return found;
  }, [myUserId, rounds, assignmentsQueries, USE_MOCK]);

  const notifsQuery = useQuery({
    queryKey: ["judge-notifs"],
    queryFn: () => notificationApi.getMyNotifications({ page: 0, size: 5 }),
    enabled: !USE_MOCK,
  });


  let dashboard: JudgeDashboardData;

  if (USE_MOCK) {
    dashboard = judgeDashboardMock;
  } else {
    let totalPending = 0;
    let totalCompleted = 0;
    myAssignments.forEach(task => {
      const completed = task.scoringProgress || 0;
      const total = task.totalToScore || 0;
      totalCompleted += completed;
      totalPending += Math.max(0, total - completed);
    });

    const activeTask = myAssignments[0] || null;

    const calibrations = calibrationsQuery.data || [];
    const hasCalibration = calibrations.length > 0;
    const calibrationCompleted = false;

    const notifs = notifsQuery.data?.content || (notifsQuery.data as any)?.data?.content || [];
    const recentActivities = notifs.slice(0, 3).map((n: any, i: number) => ({
      id: `act-${i}`,
      time: new Date(n.sentAt || n.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
      title: n.title,
      description: n.body,
    }));

    const pendingActions: any[] = [];
    
    if (hasCalibration && !calibrationCompleted) {
      pendingActions.push({
        id: "complete-calibration",
        title: "Complete calibration round",
        description: "You must finish calibration before official grading is available.",
        priority: "High",
        actionLabel: "Start Calibration",
        path: "/judge/calibrations"
      });
    }

    if (totalPending > 0) {
      pendingActions.push({
        id: "grade-pending-submissions",
        title: "Grade pending submissions",
        description: `${totalPending} submissions are waiting for your scorecards.`,
        priority: "High",
        actionLabel: "Start Grading",
        path: "/judge/submissions"
      });
    }

    if (pendingActions.length === 0) {
      pendingActions.push({
        id: "all-done",
        title: "All caught up",
        description: "No pending submissions to grade.",
        priority: "Low",
        actionLabel: "View Events",
        path: "/judge/events"
      });
    }

    dashboard = {
      judgeName: profileQuery.data?.fullName || "Judge",
      summaryCards: [
        { title: "Assigned Events", value: activeEvent ? 1 : 0, description: "Events assigned to you", iconType: "event", color: "bg-blue-50 text-blue-600" },
        { title: "Assigned Rounds", value: myAssignments.length, description: "Rounds requiring grading", iconType: "round", color: "bg-indigo-50 text-indigo-600" },
        { title: "Pending Scorecards", value: totalPending, description: "Scorecards waiting for review", iconType: "pending", color: "bg-amber-50 text-amber-600" },
        { title: "Grading Deadline", value: activeTask?.judgingDeadline ? new Date(activeTask.judgingDeadline).toLocaleDateString() : "No Deadline", description: "Nearest grading deadline", iconType: "deadline", color: "bg-rose-50 text-rose-600" },
      ],
      currentGrading: {
        eventName: activeEvent?.name || "No Event",
        roundName: activeTask?.roundName || "No assigned round",
        trackName: activeTask?.trackId ? "Assigned Track" : "General",
        pendingSubmissions: totalPending,
        completedSubmissions: totalCompleted,
        deadline: activeTask?.judgingDeadline ? new Date(activeTask.judgingDeadline).toLocaleString() : "—",
      },
      calibration: {
        required: hasCalibration,
        completed: calibrationCompleted,
        status: hasCalibration ? "Not Completed" : "Not Required",
      },
      pendingActions: pendingActions,
      recentActivities: recentActivities.length > 0 ? recentActivities : [
        { id: "a1", time: new Date().toLocaleTimeString(), title: "System Login", description: "You logged into the Judge Portal." }
      ],
    };
  }

  const totalScorecards = dashboard.currentGrading.pendingSubmissions + dashboard.currentGrading.completedSubmissions;
  const gradingProgressPercent = totalScorecards === 0 ? 0 : Math.round((dashboard.currentGrading.completedSubmissions / totalScorecards) * 100);

  const goToEvents = () => navigate("/judge/events");
  const goToScoring = () => navigate("/judge/submissions");
  const goToCalibration = () => navigate("/judge/calibrations");
  const goToPath = (path: string) => navigate(path);

  return {
    dashboard,
    totalScorecards,
    gradingProgressPercent,
    goToEvents,
    goToScoring,
    goToCalibration,
    goToPath,
  };
}
