import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { userApi } from "@/api/user.api";
import { judgeApi } from "@/api/judge.api";
import { notificationApi } from "@/api/notification.api";
import { eventApi } from "@/api/event.api";
import { roundApi } from "@/api/round.api";
import { trackApi } from "@/api/track.api";
import { useJudgeCalibrationRoundsQuery } from "@/features/calibration/hooks/useCalibrationQueries";
import type { JudgeDashboardData } from "../schemas/judgeDashboard.schema";

function formatDateTime(value?: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not set"
    : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export function useJudgeDashboard() {
  const navigate = useNavigate();

  const profileQuery = useQuery({
    queryKey: ["judge-profile"],
    queryFn: () => userApi.getMyProfile(),
  });

  const assignmentsQuery = useQuery({
    queryKey: ["judge-my-assignments"],
    queryFn: () => judgeApi.getMyAssignments(),
  });
  const myAssignments = assignmentsQuery.data || [];
  const activeTask = myAssignments[0] ?? null;

  const summaryQuery = useQuery({
    queryKey: ["judge-submission-summary"],
    queryFn: () => judgeApi.getMySubmissionSummary(),
  });
  const summary = summaryQuery.data;

  const calibrationsQuery = useJudgeCalibrationRoundsQuery();

  const notifsQuery = useQuery({
    queryKey: ["judge-notifs"],
    queryFn: () => notificationApi.getMyNotifications({ page: 0, size: 5 }),
  });

  const roundQuery = useQuery({
    queryKey: ["judge-dashboard-round", activeTask?.roundId],
    queryFn: () => roundApi.getRoundById(activeTask!.roundId),
    enabled: Boolean(activeTask?.roundId),
  });

  const trackQuery = useQuery({
    queryKey: ["judge-dashboard-track", activeTask?.trackId],
    queryFn: () => trackApi.getTrackById(activeTask!.trackId!),
    enabled: Boolean(activeTask?.trackId),
  });

  const eventQuery = useQuery({
    queryKey: ["judge-dashboard-event", roundQuery.data?.eventId],
    queryFn: () => eventApi.getEventById(roundQuery.data!.eventId),
    enabled: Boolean(roundQuery.data?.eventId),
  });

  const totalPending = (summary?.pending ?? 0) + (summary?.draftSaved ?? 0);
  const totalCompleted = (summary?.submitted ?? 0) + (summary?.locked ?? 0);
  const assignedRoundCount = new Set(
    myAssignments.map((assignment) => assignment.roundId),
  ).size;

  const calibrations = calibrationsQuery.data || [];
  const requiredCalibrations = calibrations.filter((round) => round.mandatory);
  const hasCalibration = requiredCalibrations.length > 0;
  const calibrationCompleted =
    !hasCalibration ||
    requiredCalibrations.every(
      (round) => round.submittedByCurrentJudge === true,
    );

  const recentActivities = (notifsQuery.data?.content ?? [])
    .slice(0, 3)
    .map((notification) => ({
      id: notification.id,
      time: formatDateTime(notification.sentAt ?? notification.scheduledAt),
      title: notification.title,
      description: notification.body,
    }));

  const pendingActions: JudgeDashboardData["pendingActions"] = [];

  if (hasCalibration && !calibrationCompleted) {
    pendingActions.push({
      id: "complete-calibration",
      title: "Complete calibration round",
      description:
        "You must finish calibration before official grading is available.",
      priority: "High",
      actionLabel: "Start Calibration",
      path: "/judge/calibrations",
    });
  }

  if (totalPending > 0) {
    pendingActions.push({
      id: "grade-pending-submissions",
      title: "Grade pending submissions",
      description: `${totalPending} submissions are waiting for your scorecards.`,
      priority: "High",
      actionLabel: "Start Grading",
      path: "/judge/submissions",
    });
  }

  if (pendingActions.length === 0) {
    pendingActions.push({
      id: "all-done",
      title: "All caught up",
      description: "No pending submissions to grade.",
      priority: "Low",
      actionLabel: "View Assignments",
      path: "/judge/submissions",
    });
  }

  const deadline = formatDateTime(
    roundQuery.data?.judgingDeadline ?? roundQuery.data?.endAt,
  );

  const dashboard: JudgeDashboardData = {
    judgeName: profileQuery.data?.fullName || "Judge",
    summaryCards: [
      {
        title: "Assigned Rounds",
        value: assignedRoundCount,
        description: "Rounds requiring your grading",
        iconType: "round",
        color: "bg-indigo-50 text-indigo-600",
      },
      {
        title: "Pending Scorecards",
        value: totalPending,
        description: "Submissions waiting for review",
        iconType: "pending",
        color: "bg-amber-50 text-amber-600",
      },
      {
        title: "Completed Scorecards",
        value: totalCompleted,
        description: "Submissions already graded",
        iconType: "completed",
        color: "bg-emerald-50 text-emerald-600",
      },
      {
          title: "Assignment Deadline",
          value: deadline,
          description: "Deadline for the active assignment",
        iconType: "deadline",
        color: "bg-rose-50 text-rose-600",
      },
    ],
    currentGrading: {
      eventName: eventQuery.data?.name ?? "No active event",
      roundName: roundQuery.data?.name ?? "No assigned round",
      trackName:
        trackQuery.data?.name ??
        (activeTask?.trackId ? "Track unavailable" : "All tracks"),
      pendingSubmissions: totalPending,
      completedSubmissions: totalCompleted,
      deadline,
    },
    calibration: {
      required: hasCalibration,
      completed: calibrationCompleted,
      status: !hasCalibration
        ? "Not required"
        : calibrationCompleted
          ? "Completed"
          : "Not Completed",
    },
    pendingActions,
    recentActivities,
  };

  const totalScorecards =
    dashboard.currentGrading.pendingSubmissions +
    dashboard.currentGrading.completedSubmissions;
  const gradingProgressPercent =
    totalScorecards === 0
      ? 0
      : Math.round(
          (dashboard.currentGrading.completedSubmissions / totalScorecards) *
            100,
        );

  const goToScoring = () => navigate("/judge/submissions");
  const goToCalibration = () => navigate("/judge/calibrations");
  const goToPath = (path: string) => navigate(path);

  const isLoading = [
    profileQuery,
    assignmentsQuery,
    summaryQuery,
    calibrationsQuery,
    notifsQuery,
    roundQuery,
    trackQuery,
    eventQuery,
  ].some((query) => query.isLoading);

  const isError = [
    profileQuery,
    assignmentsQuery,
    summaryQuery,
    calibrationsQuery,
    notifsQuery,
    roundQuery,
    trackQuery,
    eventQuery,
  ].some((query) => query.isError);

  const retry = () => {
    profileQuery.refetch();
    assignmentsQuery.refetch();
    summaryQuery.refetch();
    calibrationsQuery.refetch();
    notifsQuery.refetch();
    if (activeTask?.roundId) roundQuery.refetch();
    if (activeTask?.trackId) trackQuery.refetch();
    if (roundQuery.data?.eventId) eventQuery.refetch();
  };

  return {
    dashboard,
    isLoading,
    isError,
    retry,
    totalScorecards,
    gradingProgressPercent,
    goToScoring,
    goToCalibration,
    goToPath,
  };
}
