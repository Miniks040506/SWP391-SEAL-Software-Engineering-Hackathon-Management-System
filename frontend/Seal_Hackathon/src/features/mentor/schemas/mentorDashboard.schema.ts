import { z } from "zod";

export const mentorSummaryIconTypes = [
  "event",
  "track",
  "team",
  "feedback",
  "deadline",
] as const;

export const feedbackStatuses = ["Not Given", "Given"] as const;

export const mentorSummaryCardSchema = z.object({
  title: z.string(),
  value: z.union([z.string(), z.number()]),
  description: z.string(),
  iconType: z.enum(mentorSummaryIconTypes),
  color: z.string(),
});

export const mentorAssignedTrackSchema = z.object({
  eventName: z.string(),
  trackName: z.string(),
  teamCount: z.number().min(0),
  recentSubmissionCount: z.number().min(0),
  pendingFeedbackCount: z.number().min(0),
});

export const mentorSubmissionSchema = z.object({
  id: z.string(),
  teamName: z.string(),
  projectName: z.string(),
  submittedAt: z.string(),
  feedbackStatus: z.enum(feedbackStatuses),
});

export const mentorScheduleItemSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  context: z.string(),
});

export const mentorDashboardSchema = z.object({
  mentorName: z.string(),
  summaryCards: z.array(mentorSummaryCardSchema),
  assignedTrack: mentorAssignedTrackSchema,
  recentSubmissions: z.array(mentorSubmissionSchema),
  upcomingSchedule: z.array(mentorScheduleItemSchema),
});

export type MentorSummaryCard = z.infer<typeof mentorSummaryCardSchema>;
export type MentorAssignedTrack = z.infer<typeof mentorAssignedTrackSchema>;
export type MentorSubmission = z.infer<typeof mentorSubmissionSchema>;
export type MentorScheduleItem = z.infer<typeof mentorScheduleItemSchema>;
export type MentorDashboard = z.infer<typeof mentorDashboardSchema>;
