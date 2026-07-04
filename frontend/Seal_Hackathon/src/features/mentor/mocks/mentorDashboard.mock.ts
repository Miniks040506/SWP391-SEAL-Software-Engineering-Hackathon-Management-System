import type { MentorSummaryCard } from "../components/dashboard/MentorSummaryCards";
import type { MentorAssignedTrack, MentorSubmission } from "../schemas/mentorDashboard.schema";
import type { MentorScheduleItem } from "../components/dashboard/MentorScheduleCard";

export type MentorDashboardData = {
  mentorName: string;
  summaryCards: MentorSummaryCard[];
  assignedTrack: MentorAssignedTrack;
  recentSubmissions: MentorSubmission[];
  upcomingSchedule: MentorScheduleItem[];
};

export const mentorDashboardMock: MentorDashboardData = {
  mentorName: "Thu Minh",
  summaryCards: [
    { title: "Assigned Events", value: 1, description: "Events you are mentoring", iconType: "event", color: "bg-blue-50 text-blue-600" },
    { title: "Assigned Tracks", value: 1, description: "Tracks assigned to you", iconType: "track", color: "bg-indigo-50 text-indigo-600" },
    { title: "Teams in Track", value: 12, description: "Teams under your mentoring scope", iconType: "team", color: "bg-emerald-50 text-emerald-600" },
    { title: "Pending Feedback", value: 5, description: "Submissions waiting for feedback", iconType: "feedback", color: "bg-amber-50 text-amber-600" },
    { title: "Upcoming Deadlines", value: 2, description: "Important deadlines ahead", iconType: "deadline", color: "bg-rose-50 text-rose-600" },
  ],
  assignedTrack: {
    eventName: "SEAL Spring 2026",
    trackName: "AI Track",
    teamCount: 12,
    recentSubmissionCount: 8,
    pendingFeedbackCount: 5,
  },
  recentSubmissions: [
    { id: "submission-1", teamName: "Code Warriors", projectName: "Smart Campus App", roundName: "Preliminary Round", submittedAt: "May 25, 2026 - 22:10", feedbackStatus: "Not Given" },
    { id: "submission-2", teamName: "Byte Builders", projectName: "AI Study Assistant", roundName: "Preliminary Round", submittedAt: "May 25, 2026 - 21:35", feedbackStatus: "Given" },
  ],
  upcomingSchedule: [
    { id: "schedule-1", date: "May 27, 2026", title: "Preliminary Submission Deadline", context: "SEAL Spring 2026 - AI Track" },
    { id: "schedule-2", date: "May 28, 2026", title: "Mentor Feedback Deadline", context: "SEAL Spring 2026 - AI Track" },
  ],
};
