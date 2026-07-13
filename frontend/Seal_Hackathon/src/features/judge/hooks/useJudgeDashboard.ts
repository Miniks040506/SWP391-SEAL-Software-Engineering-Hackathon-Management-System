import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { userApi } from "@/api/user.api";
import { judgeApi } from "@/api/judge.api";
import { notificationApi } from "@/api/notification.api";
import { useJudgeCalibrationRoundsQuery } from "@/features/calibration/hooks/useCalibrationQueries";

import { judgeDashboardMock, type JudgeDashboardData } from "../mocks/judgeDashboard.mock";

const USE_MOCK = true;

export function useJudgeDashboard() {
  const navigate = useNavigate();

  // --- Profile ---
  const profileQuery = useQuery({
    queryKey: ["judge-profile"],
    queryFn: () => userApi.getMyProfile(),
    enabled: !USE_MOCK,
  });

  // --- My assignments from the judge-specific API (no admin auth required) ---
  const assignmentsQuery = useQuery({
    queryKey: ["judge-my-assignments"],
    queryFn: () => judgeApi.getMyAssignments(),
    enabled: !USE_MOCK,
  });
  const myAssignments = assignmentsQuery.data || [];

  // --- Submission summary (pending / completed) ---
  const summaryQuery = useQuery({
    queryKey: ["judge-submission-summary"],
    queryFn: () => judgeApi.getMySubmissionSummary(),
    enabled: !USE_MOCK,
  });
  const summary = summaryQuery.data as any;

  // --- Calibration rounds ---
  const calibrationsQuery = useJudgeCalibrationRoundsQuery();

  // --- Notifications ---
  const notifsQuery = useQuery({
    queryKey: ["judge-notifs"],
    queryFn: () => notificationApi.getMyNotifications({ page: 0, size: 5 }),
    enabled: !USE_MOCK,
  });

  // --- Compute totals ---
  const totalPending = useMemo(() => {
    // Try summary API first; fall back to summing assignments
    if (summary?.pendingCount != null) return summary.pendingCount as number;
    if (summary?.totalPending != null) return summary.totalPending as number;
    return myAssignments.reduce((acc: number, a: any) => {
      const done = a.scoringProgress ?? 0;
      const total = a.totalToScore ?? 0;
      return acc + Math.max(0, total - done);
    }, 0);
  }, [summary, myAssignments]);

  const totalCompleted = useMemo(() => {
    if (summary?.completedCount != null) return summary.completedCount as number;
    if (summary?.totalCompleted != null) return summary.totalCompleted as number;
    return myAssignments.reduce((acc: number, a: any) => acc + (a.scoringProgress ?? 0), 0);
  }, [summary, myAssignments]);

  let dashboard: JudgeDashboardData;

  if (USE_MOCK) {
    dashboard = judgeDashboardMock;
  } else {
    const activeTask = myAssignments[0] as any || null;

    const calibrations = calibrationsQuery.data || [];
    const requiredCalibrations = calibrations.filter((r: any) => r.mandatory);
    const hasCalibration = requiredCalibrations.length > 0;
    const calibrationCompleted = !hasCalibration
      || requiredCalibrations.every((r: any) => r.submittedByCurrentJudge === true);

    const notifs = notifsQuery.data?.content || (notifsQuery.data as any)?.data?.content || [];
    const recentActivities = notifs.slice(0, 3).map((n: any, i: number) => ({
      id: `act-${i}`,
      time: new Date(n.sentAt || n.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
      title: n.title || "Notification",
      description: n.body || n.message || "",
    }));

    const pendingActions: any[] = [];

    if (hasCalibration && !calibrationCompleted) {
      pendingActions.push({
        id: "complete-calibration",
        title: "Complete calibration round",
        description: "You must finish calibration before official grading is available.",
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

    // Derive event & round name from the active assignment's roundId
    const eventName = (summary as any)?.eventName
      || (activeTask as any)?.eventName
      || (myAssignments.length > 0 ? "Assigned Event" : "No Event");
    const roundName = (activeTask as any)?.roundName
      || (myAssignments.length > 0 ? `Round (${(activeTask as any)?.roundId?.slice(0, 8) ?? ""}...)` : "No assigned round");
    const deadline = (activeTask as any)?.judgingDeadline
      ? new Date((activeTask as any).judgingDeadline).toLocaleString()
      : (summary as any)?.deadline
        ? new Date((summary as any).deadline).toLocaleString()
        : "—";

    dashboard = {
      judgeName: profileQuery.data?.fullName || "Judge",
      summaryCards: [
        {
          title: "Assigned Rounds",
          value: myAssignments.length,
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
          title: "Grading Deadline",
          value: deadline !== "—" ? new Date(deadline).toLocaleDateString() : "No Deadline",
          description: "Nearest grading deadline",
          iconType: "deadline",
          color: "bg-rose-50 text-rose-600",
        },
      ],
      currentGrading: {
        eventName,
        roundName,
        trackName: (activeTask as any)?.trackId ? `Track ${(activeTask as any).trackId.slice(0, 6)}...` : "General",
        pendingSubmissions: totalPending,
        completedSubmissions: totalCompleted,
        deadline,
      },
      calibration: {
        required: hasCalibration,
        completed: calibrationCompleted,
        status: calibrationCompleted ? "Completed" : "Not Completed",
      },
      pendingActions,
      recentActivities:
        recentActivities.length > 0
          ? recentActivities
          : [
            {
              id: "a1",
              time: new Date().toLocaleTimeString(),
              title: "System Login",
              description: "You logged into the Judge Portal.",
            },
          ],
    };
  }

  const totalScorecards = dashboard.currentGrading.pendingSubmissions + dashboard.currentGrading.completedSubmissions;
  const gradingProgressPercent =
    totalScorecards === 0
      ? 0
      : Math.round((dashboard.currentGrading.completedSubmissions / totalScorecards) * 100);

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
