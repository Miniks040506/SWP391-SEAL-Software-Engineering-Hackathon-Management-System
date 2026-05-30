import { z } from "zod";

export const EVENT_SEASONS = ["Spring", "Summer", "Fall"] as const;

export const ADVANCEMENT_RULE_TYPES = [
  "Top-N Teams",
  "Threshold Score",
  "Manual Selection",
] as const;

export const prizeRankOptions = ["1st", "2nd", "3rd", "Consolation"] as const;

export const prizeTargetScopeOptions = ["Event", "Track", "Round"] as const;

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
  rounds: z.array(createEventRoundSchema),
});

export const createEventPrizeSchema = z
.object({
  id: z.string(),
  rank: z.enum(prizeRankOptions),
  title: z.string().min(1, "Prize title is required").max(200),
  value: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),

  targetScope: z.enum(prizeTargetScopeOptions),
  targetTrackId: z.string().optional().or(z.literal("")),
  targetRoundId: z.string().optional().or(z.literal("")),
})
  .superRefine((data, ctx) => {
    if (data.targetScope === "Track" && !data.targetTrackId){
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetTrackId"],
        message: "Track is required for track prize.",
      });
    }

    if (data.targetScope === "Round" && !data.targetRoundId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetRoundId"],
        message: "Round is require for round prize.",
      });
    } 
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

    if (
      data.competitionStartDate &&
      data.competitionEndDate &&
      data.competitionStartDate >= data.competitionEndDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["competitionEndDate"],
        message: "Competition end date must be after competition start date.",
      });
    }

    if (
      data.registrationClose &&
      data.competitionStartDate &&
      data.registrationClose >= data.competitionStartDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["competitionStartDate"],
        message:
          "Competition start date must be after registration close date.",
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

export const createEmptyPrize = (): PrizeFormValues => ({
  id: crypto.randomUUID(),
  rank: "1st",
  title: "",
  value: "",
  description: "",
  targetScope: "Event",
  targetTrackId: "",
  targetRoundId: "",
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
  registrationOpen: "",
  registrationClose: "",
  competitionStartDate: "",
  competitionEndDate: "",
  description: "",
  bannerFile: null,
  tracks: [],
  prizes: [],
  mentorJudgeAssignments: [],
  criteria: [],
};