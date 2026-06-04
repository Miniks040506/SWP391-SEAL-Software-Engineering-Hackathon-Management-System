import type { MentorDashboardData } from "../schemas/mentorDashboard.schema";

export const mentorDashboardMock: MentorDashboardData = {
  mentorName: "Nguyen Van A",

  summaryCards: [
    {
      title: "Assigned Events",
      value: 1,
      description: "Events you are mentoring",
      iconType: "event",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Assigned Tracks",
      value: 1,
      description: "Tracks you are mentoring",
      iconType: "track",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Teams in Track",
      value: 5,
      description: "Teams in your assigned track",
      iconType: "team",
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Pending Feedback",
      value: 3,
      description: "Submissions waiting for your feedback",
      iconType: "feedback",
      color: "bg-rose-50 text-rose-600",
    },
    {
      title: "Upcoming Deadlines",
      value: 2,
      description: "Deadlines for your assigned tracks",
      iconType: "deadline",
      color: "bg-green-50 text-green-600",
    },
  ],
};
