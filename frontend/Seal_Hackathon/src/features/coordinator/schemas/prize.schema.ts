import * as z from "zod";

export const prizeFormSchema = z
  .object({
    trackId: z.string().optional(),
    rankPosition: z.preprocess(
      (val) => (val === "" || Number.isNaN(val) ? undefined : Number(val)),
      z
        .number({ error: "Rank position is required" })
        .min(1, "Rank position must be greater than 0")
    ),
    title: z
      .string({ error: "Prize title is required" })
      .min(1, "Prize title is required"),
    description: z.string().optional(),
    value: z.preprocess(
      (val) => (val === "" || Number.isNaN(val) ? null : Number(val)),
      z.number().min(0, "Value must not be negative").optional().nullable()
    ),
    currency: z.string().optional().nullable(),
    sponsorName: z.string().optional(),
  })
  .refine(
    (data) => {
      // currency required when value exists
      if (data.value !== undefined && data.value !== null && data.value > 0) {
        return !!data.currency && data.currency.trim().length > 0;
      }
      return true;
    },
    {
      message: "Currency is required when value is provided",
      path: ["currency"],
    }
  );

export type PrizeFormInput = z.input<typeof prizeFormSchema>;
export type PrizeFormValues = z.output<typeof prizeFormSchema>;

export const assignPrizesFromRankingSchema = z.object({
  roundId: z.string().optional(),
  trackId: z.string().optional(),
  overwriteExistingAwards: z.boolean().default(false),
  sendNotification: z.boolean().default(true),
  sendInApp: z.boolean().default(true),
  sendEmail: z.boolean().default(true),
});

export type AssignPrizesFromRankingFormInput = z.input<
  typeof assignPrizesFromRankingSchema
>;
export type AssignPrizesFromRankingFormValues = z.output<
  typeof assignPrizesFromRankingSchema
>;

export const manualAwardSchema = z.object({
  teamId: z.string({ error: "Team is required" }).min(1, "Team is required"),
  reason: z.string().optional(),
  sendNotification: z.boolean().default(true),
  sendInApp: z.boolean().default(true),
  sendEmail: z.boolean().default(true),
});

export type ManualAwardFormInput = z.input<typeof manualAwardSchema>;
export type ManualAwardFormValues = z.output<typeof manualAwardSchema>;

export const clearAwardSchema = z.object({
  reason: z.string().optional(),
});

export type ClearAwardFormValues = z.infer<typeof clearAwardSchema>;
