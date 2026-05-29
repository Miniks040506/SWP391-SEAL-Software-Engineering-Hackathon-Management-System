import { z } from "zod";

export const EVENT_SEASONS = ["Spring", "Summer", "Fall"] as const;

export const ADVANCEMENT_RULE_TYPES = [
  "Top-N Teams",
  "Threshold Score",
  "Manual Selection",
] as const;

export const createEventRoundSchema = z
  .object({
    id: z.string(),
    roundName: z.string().min(1, "Round name is required").max(200),
    submissionDeadline: z.string().min(1, "Submission deadline is required"),
    judgingDeadline: z.string().min(1, "Judging deadline is required"),
    advancementRuleType: z.enum(ADVANCEMENT_RULE_TYPES),
    advancementRuleValue: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (
      data.submissionDeadline &&
      data.judgingDeadline &&
      data.submissionDeadline >= data.judgingDeadline
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["judgingDeadline"],
        message: "Judging deadline must be after submission deadline.",
      });
    }

    if (
      data.advancementRuleType === "Top-N Teams" &&
      !data.advancementRuleValue
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["advancementRuleValue"],
        message: "Value is required for Top-N Teams rule.",
      });
    }
  });

export const createEventTrackSchema = z.object({
  id: z.string(),
  trackName: z.string().min(1, "Track name is required").max(200),
  description: z.string().optional().or(z.literal("")),
  rounds: z
    .array(createEventRoundSchema)
});

export const createEventDetailsSchema = z
  .object({
    eventName: z.string().min(1, "Event name is required").max(200),
    season: z
      .union([z.enum(EVENT_SEASONS), z.literal("")])
      .refine((value) => value !== "", {
        message: "Season is required",
      }),
    registrationOpen: z.string().min(1, "Registration open date is required"),
    registrationClose: z.string().min(1, "Registration close date is required"),
    competitionStartDate: z
      .string()
      .min(1, "Competition start date is required"),
    competitionEndDate: z.string().min(1, "Competition end date is required"),
    description: z.string().optional().or(z.literal("")),
    bannerFile: z
      .custom<File | null>(
        (value) => value === null || value instanceof File,
        "Invalid banner file",
      )
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (
      data.registrationOpen &&
      data.registrationClose &&
      data.registrationOpen >= data.registrationClose
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["registrationClose"],
        message:
          "Registration close date must be after registration open date.",
      });
    }
  });

export const createEventSchema = createEventDetailsSchema.safeExtend({
  tracks: z
    .array(createEventTrackSchema)
});

export type CreateEventFormValues = z.input<typeof createEventSchema>;
export type CreateEventPayload = z.output<typeof createEventSchema>;export type TrackFormValues = z.infer<typeof createEventTrackSchema>;
export type RoundFormValues = z.infer<typeof createEventRoundSchema>;

export const createEmptyRound = (): RoundFormValues => ({
  id: crypto.randomUUID(),
  roundName: "",
  submissionDeadline: "",
  judgingDeadline: "",
  advancementRuleType: "Top-N Teams",
  advancementRuleValue: "",
});

export const createEmptyTrack = (): TrackFormValues => ({
  id: crypto.randomUUID(),
  trackName: "",
  description: "",
  rounds: [],
});

export const initialCreateEventFormValues: CreateEventFormValues = {
  eventName: "",
  season: "",
  registrationOpen: "",
  registrationClose: "",
  competitionStartDate: "",
  competitionEndDate: "",
  description: "",
  bannerFile: null,
  tracks: [],
};
