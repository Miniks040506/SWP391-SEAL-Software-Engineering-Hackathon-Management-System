import { z } from "zod";

export const ANNOUNCEMENT_TARGET_SCOPES = [
  "ALL",
  "TRACK",
  "TEAM",
  "JUDGE",
  "COORDINATION",
  "STUDENT",
  "SINGLE_USER",
] as const;

export const ANNOUNCEMENT_CHANNELS = ["IN_APP", "EMAIL"] as const;

export const ANNOUNCEMENT_SCHEDULE_MODES = [
  "SEND_NOW",
  "SCHEDULE_LATER",
] as const;

export const announcementFormSchema = z
  .object({
    eventId: z.string().min(1, "Event is required."),

    title: z.string().min(1, "Title is required.").max(300),
    content: z.string().min(1, "Content is required."),

    pinned: z.boolean().default(false),
    resultAnnouncement: z.boolean().default(false),

    sendInApp: z.boolean().default(true),
    sendEmail: z.boolean().default(false),

    targetScope: z.enum(ANNOUNCEMENT_TARGET_SCOPES).default("ALL"),
    targetId: z.string().optional().or(z.literal("")),
    targetTrackIds: z.array(z.string()).default([]),
    targetRoleNames: z.array(z.string()).default([]),

    scheduleMode: z.enum(ANNOUNCEMENT_SCHEDULE_MODES).default("SEND_NOW"),
    scheduledAt: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (!data.sendInApp && !data.sendEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sendInApp"],
        message: "Select at least one channel.",
      });
    }

    if (data.targetScope === "TRACK" && data.targetTrackIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetTrackIds"],
        message: "Select at least one track.",
      });
    }

    if (
      (data.targetScope === "TEAM" || data.targetScope === "SINGLE_USER") &&
      !data.targetId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetId"],
        message: "Target ID is required.",
      });
    }

    if (data.scheduleMode === "SCHEDULE_LATER" && !data.scheduledAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledAt"],
        message: "Scheduled time is required.",
      });
    }

    if (data.scheduleMode === "SCHEDULE_LATER" && data.scheduledAt) {
      const selectedDate = new Date(data.scheduledAt);
      const now = new Date();

      if (selectedDate <= now) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledAt"],
          message: "Scheduled time must be in the future.",
        });
      }
    }
  });

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

export type AnnouncementAction = "DRAFT" | "PUBLISH" | "SCHEDULE";

export const initialAnnouncementFormValues: AnnouncementFormValues = {
  eventId: "",
  title: "",
  content: "",
  pinned: false,
  resultAnnouncement: false,
  sendInApp: true,
  sendEmail: false,
  targetScope: "ALL",
  targetId: "",
  targetTrackIds: [],
  targetRoleNames: [],
  scheduleMode: "SEND_NOW",
  scheduledAt: "",
};
