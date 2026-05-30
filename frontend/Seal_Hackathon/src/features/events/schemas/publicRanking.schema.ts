import { z } from "zod";

export const leaderboardQuerySchema = z.object({
  eventId: z.string().uuid().nullable().catch(null),
  roundId: z.string().uuid().nullable().catch(null),
  trackId: z.string().uuid().nullable().catch(null),
});

export type LeaderboardQueryValues = z.infer<typeof leaderboardQuerySchema>;