import type { EventCompetitionRoundResponse } from "@/types/team.types";

export type CountdownUrgency =
  | "idle"
  | "closed"
  | "calm"
  | "warning"
  | "critical"
  | "over";

export type CountdownState = {
  urgency: CountdownUrgency;
  parts: { label: string; value: string }[];
  msRemaining: number;
};

const HOUR = 3_600_000;
const DAY = 86_400_000;

/**
 * Splits the remaining submission time into display segments and derives an
 * urgency level so the UI can escalate colour as the deadline approaches.
 */
export function getCountdownState(
  round: EventCompetitionRoundResponse | null | undefined,
  now: number,
): CountdownState {
  if (!round) {
    return { urgency: "idle", parts: [], msRemaining: 0 };
  }

  if (!round.open) {
    // A round that already ran is closed for good; one that never opened is
    // simply waiting on a coordinator. They must not read the same.
    const closed =
      round.submissionLocked || (round.status !== "UPCOMING" && !round.open);
    return { urgency: closed ? "closed" : "idle", parts: [], msRemaining: 0 };
  }

  const deadline = round.submissionDeadline;
  if (!deadline) {
    return { urgency: "idle", parts: [], msRemaining: 0 };
  }

  const msRemaining = new Date(deadline).getTime() - now;
  if (msRemaining <= 0) {
    return { urgency: "over", parts: [], msRemaining: 0 };
  }

  const totalSeconds = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (value: number) => value.toString().padStart(2, "0");
  const parts =
    days > 0
      ? [
          { label: "Days", value: pad(days) },
          { label: "Hours", value: pad(hours) },
          { label: "Min", value: pad(minutes) },
        ]
      : [
          { label: "Hours", value: pad(hours) },
          { label: "Min", value: pad(minutes) },
          { label: "Sec", value: pad(seconds) },
        ];

  const urgency: CountdownUrgency =
    msRemaining < HOUR ? "critical" : msRemaining < DAY ? "warning" : "calm";

  return { urgency, parts, msRemaining };
}

/** Percentage of the round window already elapsed, clamped to 0–100. */
export function roundElapsedPercent(
  round: EventCompetitionRoundResponse,
  now: number,
) {
  const start = round.startAt ? new Date(round.startAt).getTime() : null;
  const end = round.submissionDeadline
    ? new Date(round.submissionDeadline).getTime()
    : round.endAt
      ? new Date(round.endAt).getTime()
      : null;

  if (!start || !end || end <= start) return null;
  return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
}
