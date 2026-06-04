import type { JudgeDashboardData } from "../schemas/judgeDashboard.schema";

export const judgeDashboardMock: JudgeDashboardData = {
  judgeName: "Thu Minh",

  summaryCards: [
    {
      title: "Assigned Events",
      value: 1,
      description: "Events assigned to you",
      iconType: "event",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Assigned Rounds",
      value: 2,
      description: "Rounds requiring grading",
      iconType: "round",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Pending Scorecards",
      value: 8,
      description: "Scorecards waiting for review",
      iconType: "pending",
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Grading Deadline",
      value: "May 28, 2026",
      description: "Nearest grading deadline",
      iconType: "deadline",
      color: "bg-rose-50 text-rose-600",
    },
  ],

  currentGrading: {
    eventName: "SEAL Spring 2026",
    roundName: "Preliminary Round",
    trackName: "AI Track",
    pendingSubmissions: 8,
    completedSubmissions: 4,
    deadline: "May 28, 2026 - 23:59",
  },

  calibration: {
    required: true,
    completed: false,
    status: "Not Completed",
  },

  pendingActions: [
    {
      id: "complete-calibration",
      title: "Complete calibration round",
      description:
        "You must finish calibration before official grading is available.",
      priority: "High",
      actionLabel: "Start Calibration",
      path: "/judge/calibration",
    },
    {
      id: "grade-pending-submissions",
      title: "Grade pending submissions",
      description: "8 submissions are waiting for your scorecards.",
      priority: "High",
      actionLabel: "Start Grading",
      path: "/judge/scoring",
    },
    {
      id: "review-assigned-rounds",
      title: "Review assigned rounds",
      description:
        "Check your assigned event, track, round, and grading deadline.",
      priority: "Medium",
      actionLabel: "View Assigned Events",
      path: "/judge/events",
    },
  ],

  recentActivities: [
    {
      id: "activity-1",
      time: "Today, 09:30",
      title: "Assigned to Preliminary Round",
      description:
        "You were assigned to grade submissions for SEAL Spring 2026 - AI Track.",
    },
    {
      id: "activity-2",
      time: "Yesterday, 16:45",
      title: "Calibration round opened",
      description:
        "A calibration round is available and must be completed before official grading.",
    },
    {
      id: "activity-3",
      time: "May 24, 2026",
      title: "Scorecard draft saved",
      description:
        "Your draft scorecard for Team Alpha was saved successfully.",
    },
  ],
};
