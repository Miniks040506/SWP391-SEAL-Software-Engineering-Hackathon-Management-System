import { z } from "zod";

export const EVENT_SEASONS = ["SPRING", "SUMMER", "FALL"] as const;

export const EVENT_STATUSES = [
  "DRAFT",
  "REGISTRATION",
  "ONGOING",
  "JUDGING",
  "COMPLETED",
  "CANCELLED",
] as const;

export const REQUIRED_LINK_TYPES = [
  "REPOSITORY",
  "DEMO",
  "SLIDE",
  "REPORT",
  "VIDEO",
  "OTHER",
] as const;

export const ADVANCEMENT_RULE_TYPES = [
  "Manual Selection",
  "Top-N Teams",
  "Threshold Score",
] as const;

export const prizeCurrencyOptions = ["VND", "USD", "JPY", "KRW"] as const;

export const eventSeasonOptions = EVENT_SEASONS;
export const eventStatusOptions = EVENT_STATUSES;
export const requiredLinkTypeOptions = REQUIRED_LINK_TYPES;
export const advancementRuleOptions = ADVANCEMENT_RULE_TYPES;

const optionalTrimmedString = z.string().trim().optional().or(z.literal(""));

const optionalPositiveInt = z
  .union([
    z.coerce
      .number()
      .int("Value must be an integer.")
      .positive("Value must be greater than 0."),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .optional();

const optionalNonNegativeNumber = z
  .union([
    z.coerce.number().min(0, "Value must be greater than or equal to 0."),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .optional();

const optionalPositiveNumber = z
  .union([
    z.coerce.number().positive("Value must be greater than 0."),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .optional();

export const createEventDetailsSchema = z
  .object({
    eventName: z
      .string()
      .trim()
      .min(1, "Event name is required.")
      .max(200, "Event name must not exceed 200 characters."),

    season: z.enum(EVENT_SEASONS),

    year: z.coerce
      .number()
      .int("Year must be an integer.")
      .min(2024, "Year must be at least 2024.")
      .max(2100, "Year is invalid."),

    status: z.enum(EVENT_STATUSES).default("DRAFT").optional(),

    registrationStartAt: z
      .string()
      .trim()
      .min(1, "Registration start time is required."),

    registrationEndAt: z
      .string()
      .trim()
      .min(1, "Registration end time is required."),

    description: optionalTrimmedString,

    bannerFile: z.custom<File | null>().nullable().optional(),

    bannerUrl: optionalTrimmedString,
  })
  .superRefine((values, ctx) => {
    if (
      values.registrationStartAt &&
      values.registrationEndAt &&
      values.registrationStartAt >= values.registrationEndAt
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["registrationEndAt"],
        message: "Registration end time must be after start time.",
      });
    }
  });

export const createTrackSchema = z.object({
  id: z.string(),

  trackName: z
    .string()
    .trim()
    .min(1, "Track name is required.")
    .max(200, "Track name must not exceed 200 characters."),

  description: optionalTrimmedString,

  maxTeams: optionalPositiveInt,

  requiredLinkTypes: z.array(z.enum(REQUIRED_LINK_TYPES)).default([]),
});

export const createPrizeSchema = z.object({
  id: z.string(),

  eventId: optionalTrimmedString,

  trackId: optionalTrimmedString,

  rankPosition: optionalPositiveInt,

  title: z
    .string()
    .trim()
    .min(1, "Prize title is required.")
    .max(200, "Prize title must not exceed 200 characters."),

  description: optionalTrimmedString,

  value: optionalNonNegativeNumber,

  currency: z.enum(prizeCurrencyOptions).optional().or(z.literal("")),

  sponsorName: optionalTrimmedString,
});

export const createRoundSchema = z
  .object({
    id: z.string(),

    roundName: z
      .string()
      .trim()
      .min(1, "Round name is required.")
      .max(200, "Round name must not exceed 200 characters."),

    orderIndex: z.coerce
      .number()
      .int("Order index must be an integer.")
      .min(0, "Order index must be greater than or equal to 0."),

    isFinal: z.boolean().default(false),

    submissionDeadline: optionalTrimmedString,

    judgingDeadline: optionalTrimmedString,

    advancementRuleType: z
      .enum(ADVANCEMENT_RULE_TYPES)
      .default("Manual Selection"),

    advancementRuleValue: optionalTrimmedString,
  })
  .superRefine((values, ctx) => {
    if (
      values.submissionDeadline &&
      values.judgingDeadline &&
      values.submissionDeadline >= values.judgingDeadline
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["judgingDeadline"],
        message: "Judging deadline must be after submission deadline.",
      });
    }

    if (
      values.advancementRuleType !== "Manual Selection" &&
      !values.advancementRuleValue
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["advancementRuleValue"],
        message: "Rule value is required for this advancement rule.",
      });
    }
  });

export const createJudgeTrackRoundAssignmentSchema = z.object({
  id: z.string(),
  trackId: z.string().min(1, "Track is required."),
  roundId: z.string().min(1, "Round is required."),
  totalToScore: optionalPositiveInt,
});

export const createMentorJudgeAssignmentSchema = z
  .object({
    id: z.string(),

    userId: z.string().min(1, "User id is required."),

    // Do not hard-validate judgeId as UUID on FE. It can be either Judge.id or User.id,
    // and BE resolves both safely.
    judgeId: z.string().nullish().or(z.literal("")),

    email: z.string().email("Invalid email."),

    fullName: z.string().trim().min(1, "Full name is required."),

    role: z.enum(["MENTOR", "JUDGE"]),

    assignedTrackIds: z.array(z.string()).default([]),

    judgeRoundAssignments: z
      .array(createJudgeTrackRoundAssignmentSchema)
      .default([]),

    assignedRoundIds: z.array(z.string()).default([]),
  })
  .superRefine((values, ctx) => {
    if (values.role === "MENTOR" && values.assignedTrackIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["assignedTrackIds"],
        message: "Please assign this mentor to at least one track.",
      });
    }

    if (values.role === "JUDGE" && values.judgeRoundAssignments.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["judgeRoundAssignments"],
        message: "Please assign this judge to at least one track round.",
      });
    }
  });

export const createEventCriteriaSchema = z.object({
  id: z.string(),

  name: z
    .string()
    .trim()
    .max(200, "Criteria name must not exceed 200 characters.")
    .optional()
    .or(z.literal("")),

  description: optionalTrimmedString,

  maxScore: optionalPositiveNumber,

  weight: optionalPositiveNumber,

  category: optionalTrimmedString,

  isTechnical: z.boolean().default(false).optional(),
});

export const createEventSchema = createEventDetailsSchema.extend({
  tracks: z.array(createTrackSchema).min(1, "Create at least one track."),

  prizes: z.array(createPrizeSchema).default([]),

  rounds: z.array(createRoundSchema).min(1, "Create at least one round."),

  mentorJudgeAssignments: z.array(createMentorJudgeAssignmentSchema).default([]),

  criteria: z.array(createEventCriteriaSchema).default([]),
});

export type CreateEventFormValues = z.infer<typeof createEventSchema>;
export type CreateEventPayload = CreateEventFormValues;

export type TrackFormValues = z.infer<typeof createTrackSchema>;
export type PrizeFormValues = z.infer<typeof createPrizeSchema>;
export type RoundFormValues = z.infer<typeof createRoundSchema>;
export type JudgeTrackRoundAssignmentFormValues = z.infer<
  typeof createJudgeTrackRoundAssignmentSchema
>;
export type MentorJudgeAssignmentFormValues = z.infer<
  typeof createMentorJudgeAssignmentSchema
>;
export type EventCriteriaFormValues = z.infer<typeof createEventCriteriaSchema>;

export const createEmptyTrack = (): TrackFormValues => ({
  id: crypto.randomUUID(),
  trackName: "",
  description: "",
  maxTeams: "",
  requiredLinkTypes: [],
});

export const createEmptyPrize = (): PrizeFormValues => ({
  id: crypto.randomUUID(),
  eventId: "",
  trackId: "",
  rankPosition: "",
  title: "",
  description: "",
  value: "",
  currency: "VND",
  sponsorName: "",
});

export const createEmptyRound = (orderIndex = 0): RoundFormValues => ({
  id: crypto.randomUUID(),
  roundName: "",
  orderIndex,
  isFinal: false,
  submissionDeadline: "",
  judgingDeadline: "",
  advancementRuleType: "Manual Selection",
  advancementRuleValue: "",
});

export const createEmptyCriteria = (): EventCriteriaFormValues => ({
  id: crypto.randomUUID(),
  name: "",
  description: "",
  maxScore: "",
  weight: "",
  category: "",
  isTechnical: false,
});

export const createMentorJudgeAssignment = (values: {
  userId: string;
  judgeId?: string | null;
  email: string;
  fullName: string;
  role: "MENTOR" | "JUDGE";
}): MentorJudgeAssignmentFormValues => ({
  id: crypto.randomUUID(),
  userId: values.userId,
  judgeId: values.role === "JUDGE" ? values.judgeId || values.userId : "",
  email: values.email,
  fullName: values.fullName,
  role: values.role,
  assignedTrackIds: [],
  assignedRoundIds: [],
  judgeRoundAssignments: [],
});

export const createJudgeTrackRoundAssignment = (
  trackId: string,
  roundId: string,
): JudgeTrackRoundAssignmentFormValues => ({
  id: crypto.randomUUID(),
  trackId,
  roundId,
  totalToScore: "",
});

export const initialCreateEventFormValues: CreateEventFormValues = {
  eventName: "",
  season: "SPRING",
  year: new Date().getFullYear(),
  status: "DRAFT",

  registrationStartAt: "",
  registrationEndAt: "",
  description: "",
  bannerFile: null,
  bannerUrl: "",

  tracks: [],
  prizes: [],
  rounds: [],

  mentorJudgeAssignments: [],
  criteria: [],
};

// Compatibility exports for old components.
export const createEventTrackSchema = createTrackSchema;
export const createEventPrizeSchema = createPrizeSchema;
export const createEventRoundSchema = createRoundSchema;
export const createEventCriteriaItemSchema = createEventCriteriaSchema;

export type CreateEventTrackFormValues = TrackFormValues;
export type CreateEventPrizeFormValues = PrizeFormValues;
export type CreateEventRoundFormValues = RoundFormValues;
export type CreateEventCriteriaItemFormValues = EventCriteriaFormValues;

export const createEmptyEventTrack = createEmptyTrack;
export const createEmptyEventPrize = createEmptyPrize;
export const createEmptyEventRound = createEmptyRound;
export const createEmptyEventCriteria = createEmptyCriteria;
