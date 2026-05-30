import { z } from "zod";

export const seasonOptions = ["All", "SPRING", "SUMMER", "FALL"] as const;

export const publicEventsFilterSchema = z.object({
  season: z.enum(seasonOptions).catch("All"),
  page: z.coerce.number().int().min(1).catch(1),
  size: z.coerce.number().int().min(1).max(50).catch(6),
});

export type PublicEventsFilterValues = z.infer<typeof publicEventsFilterSchema>;

export const eventIdParamSchema = z.object({
  eventId: z.string().uuid("Invalid event id."),
});

export type EventIdParamValues = z.infer<typeof eventIdParamSchema>;