import { z } from "zod";

export const judgeSubmissionFilterSchema = {
  STATUSES: ["PENDING", "SCORED"],
};

export type JudgeGradingFormValues = {
  scores: Record<string, number>;
  comment?: string;
};

export const createJudgeGradingSchema = (criteria: { id: string; maxScore: number }[]) => {
  return z.object({
    scores: z.record(
      z.string(),
      z.number({ required_error: "Score is required", invalid_type_error: "Must be a number" })
        .min(0, "Score cannot be negative")
    ).superRefine((scores, ctx) => {
      criteria.forEach((crit) => {
        const score = scores[crit.id];
        if (score !== undefined && score > crit.maxScore) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Max score allowed is ${crit.maxScore}`,
            path: [crit.id], 
          });
        }
      });
    }),
    comment: z.string().max(1000, "Comment is too long").optional(),
  });
};