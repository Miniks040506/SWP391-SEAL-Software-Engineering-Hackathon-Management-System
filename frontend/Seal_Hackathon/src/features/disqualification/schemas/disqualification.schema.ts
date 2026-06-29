import { z } from "zod";

export const disqualifySchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  evidenceUrl: z
    .union([z.literal(""), z.string().url("Must be a valid URL")])
    .optional(),
});

export type DisqualifyFormValues = z.infer<typeof disqualifySchema>;

export const overturnSchema = z.object({
  overturnReason: z.string().min(1, "Reason is required"),
});

export type OverturnFormValues = z.infer<typeof overturnSchema>;

export const appealSchema = z.object({
  appealNote: z.string().min(1, "Appeal note is required"),
});

export type AppealFormValues = z.infer<typeof appealSchema>;
