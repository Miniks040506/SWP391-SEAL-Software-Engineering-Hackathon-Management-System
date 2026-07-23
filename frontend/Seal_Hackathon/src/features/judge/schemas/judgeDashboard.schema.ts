import { z } from "zod";

export const judgeSummaryIconTypes = [
  "event",
  "round",
  "pending",
  "completed",
  "deadline",
] as const;

export const calibrationStatuses = [
  "Not Completed",
  "Completed",
  "Not required",
] as const;

export const judgeSummaryCardSchema = z.object({
  title: z.string(),
  value: z.union([z.string(), z.number()]),
  description: z.string(),
  iconType: z.enum(judgeSummaryIconTypes),
  color: z.string(),
});

export const currentGradingSchema = z.object({
  eventName: z.string(),
  roundName: z.string(),
  trackName: z.string(),
  pendingSubmissions: z.number().min(0),
  completedSubmissions: z.number().min(0),
  deadline: z.string(),
});

export const calibrationSchema = z.object({
  required: z.boolean(),
  completed: z.boolean(),
  status: z.enum(calibrationStatuses),
});

export type DashboardPriority = z.infer<
  typeof judgePendingActionSchema
>["priority"];
export type JudgePendingAction = z.infer<typeof judgePendingActionSchema>;
export type JudgeRecentActivity = z.infer<typeof judgeRecentActivitySchema>;

export type JudgeSummaryCard = z.infer<typeof judgeSummaryCardSchema>;
export type CurrentGrading = z.infer<typeof currentGradingSchema>;
export type JudgeCalibration = z.infer<typeof calibrationSchema>;
export type JudgeDashboardData = z.infer<typeof judgeDashboardSchema>;

export const dashboardPriorities = ["High", "Medium", "Low"] as const;

export const judgePendingActionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(dashboardPriorities),
  actionLabel: z.string(),
  path: z.string(),
});

export const judgeRecentActivitySchema = z.object({
  id: z.string(),
  time: z.string(),
  title: z.string(),
  description: z.string(),
});

export const judgeDashboardSchema = z.object({
  judgeName: z.string(),
  summaryCards: z.array(judgeSummaryCardSchema),
  currentGrading: currentGradingSchema,
  calibration: calibrationSchema,
  pendingActions: z.array(judgePendingActionSchema),
  recentActivities: z.array(judgeRecentActivitySchema),
});
