import { z } from "zod";

export const disqualifySchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  evidenceUrl: z
    .union([z.literal(""), z.string().url("Must be a valid URL")])
    .optional(),
});

export type DisqualifyFormValues = z.infer<typeof disqualifySchema>;
