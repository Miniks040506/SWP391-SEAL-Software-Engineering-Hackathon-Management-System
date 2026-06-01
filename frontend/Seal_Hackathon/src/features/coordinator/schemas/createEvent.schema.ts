import { z } from "zod";

export const EVENT_SEASONS = ["Spring", "Summer", "Fall"] as const;

export const ADVANCEMENT_RULE_TYPES = [
  "Top-N Teams",
  "Threshold Score",
  "Manual Selection",
] as const;

export const SUBMISSION_LINK_TYPES = [
  "REPOSITORY",
  "DEMO",
  "SLIDE",
  "REPORT",
  "VIDEO",
  "OTHER",
] as const;

export const prizeCurrencyOptions = ["VND", "USD", "EUR", "JPY"] as const;
export const mentorJudgeRoleOptions = ["Mentor", "Judge"] as const;

export const criteriaTypeOptions = [
  "Technical",
  "Innovation",
  "Presentation",
  "Business",
  "UX/UI",
  "Research",
] as const;

export const createEventRoundSchema = z
  .object({
    id: z.string(),
    roundName: z.string().min(1, "Round name is required").max(200),
    orderIndex: z
      .string()
      .min(1, "Order index is required")
      .refine((value) => Number(value) > 0, {
        message: "Order index must be greater than 0",
      }),
    isFinal: z.boolean(),
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
  description: z.string().max(2000).optional().or(z.literal("")),
  maxTeams: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || Number(value) > 0, {
      message: "Max teams must be greater than 0",
    }),
  requiredLinkTypes: z.array(z.enum(SUBMISSION_LINK_TYPES)),
  rounds: z.array(createEventRoundSchema),
});

export const createEventPrizeSchema = z.object({
  id: z.string(),

  rankPosition: z
    .string()
    .min(1, "Rank position is required")
    .refine((value) => Number(value) > 0, {
      message: "Rank position must be greater than 0",
    }),

  title: z.string().min(1, "Prize title is required").max(200),

  description: z.string().max(2000).optional().or(z.literal("")),

  value: z
    .string()
    .min(1, "Prize value is required")
    .refine((value) => Number(value) > 0, {
      message: "Prize value must be greater than 0",
    }),

  currency: z.string().min(1, "Currency is required"),

  sponsorName: z.string().max(200).optional().or(z.literal("")),

  trackId: z.string().optional().or(z.literal("")),
});

export const createEventMentorJudgeSchema = z.object({
  id: z.string(),
  role: z.enum(mentorJudgeRoleOptions),
  userId: z.string().min(1, "User is required"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  assignedTrackIds: z.array(z.string()),
});

export const createEventCriteriaSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Criteria name is required").max(200),
  type: z.enum(criteriaTypeOptions),
  maxScore: z
    .string()
    .min(1, "Max score is required")
    .refine((value) => Number(value) > 0, {
      message: "Max score must be greater than 0",
    }),
  weight: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || Number(value) > 0, {
      message: "Weight must be greater than 0",
    }),
  description: z.string().optional().or(z.literal("")),
});

export const createEventDetailsSchema = z
  .object({
    eventName: z.string().min(1, "Event name is required").max(200),

    season: z
      .union([z.enum(EVENT_SEASONS), z.literal("")])
      .refine((value) => value !== "", {
        message: "Season is required",
      }),

    year: z
      .string()
      .min(1, "Year is required")
      .regex(/^\d{4}$/, "Year must be a 4-digit year"),

    registrationStartAt: z
      .string()
      .min(1, "Registration start time is required"),

    registrationEndAt: z.string().min(1, "Registration end time is required"),

    description: z.string().max(2000).optional().or(z.literal("")),

    bannerFile: z
      .custom<File | null>(
        (value) => value === null || value instanceof File,
        "Invalid banner file",
      )
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (
      data.registrationStartAt &&
      data.registrationEndAt &&
      data.registrationStartAt >= data.registrationEndAt
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["registrationEndAt"],
        message: "Registration end time must be after registration start time.",
      });
    }
  });

export const createEventSchema = createEventDetailsSchema.safeExtend({
  tracks: z.array(createEventTrackSchema),
  prizes: z.array(createEventPrizeSchema),
  mentorJudgeAssignments: z.array(createEventMentorJudgeSchema),
  criteria: z.array(createEventCriteriaSchema),
});

export type CreateEventFormValues = z.input<typeof createEventSchema>;
export type CreateEventPayload = z.output<typeof createEventSchema>;

export type RoundFormValues = z.infer<typeof createEventRoundSchema>;
export type TrackFormValues = z.infer<typeof createEventTrackSchema>;
export type PrizeFormValues = z.infer<typeof createEventPrizeSchema>;
export type MentorJudgeFormValues = z.infer<
  typeof createEventMentorJudgeSchema
>;
export type CriteriaFormValues = z.infer<typeof createEventCriteriaSchema>;

export const createEmptyRound = (orderIndex = 1): RoundFormValues => ({
  id: crypto.randomUUID(),
  roundName: "",
  orderIndex: String(orderIndex),
  isFinal: false,
  submissionDeadline: "",
  judgingDeadline: "",
  advancementRuleType: "Top-N Teams",
  advancementRuleValue: "",
});

export const createEmptyTrack = (): TrackFormValues => ({
  id: crypto.randomUUID(),
  trackName: "",
  description: "",
  maxTeams: "",
  requiredLinkTypes: [],
  rounds: [],
});

export const createEmptyPrize = (trackId = ""): PrizeFormValues => ({
  id: crypto.randomUUID(),
  rankPosition: "",
  title: "",
  description: "",
  value: "",
  currency: "VND",
  sponsorName: "",
  trackId,
});

export const createMentorJudgeAssignment = (values: {
  userId: string;
  fullName: string;
  email: string;
  role: MentorJudgeFormValues["role"];
}): MentorJudgeFormValues => ({
  id: crypto.randomUUID(),
  userId: values.userId,
  fullName: values.fullName,
  email: values.email,
  role: values.role,
  assignedTrackIds: [],
});

export const createEmptyCriteria = (): CriteriaFormValues => ({
  id: crypto.randomUUID(),
  name: "",
  type: "Technical",
  maxScore: "10",
  weight: "",
  description: "",
});

export const initialCreateEventFormValues: CreateEventFormValues = {
  eventName: "",
  season: "",
  year: "",
  registrationStartAt: "",
  registrationEndAt: "",
  description: "",
  bannerFile: null,
  tracks: [],
  prizes: [],
  mentorJudgeAssignments: [],
  criteria: [],
};
