import type { SubmissionResponse } from "@/types/submission.types";
import type { MentorFeedbackResponse } from "@/types/mentorFeedback.types";

const absoluteFormat = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dayFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

/** Absolute timestamp, matching the format used across the competition pages. */
export function formatAbsolute(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : absoluteFormat.format(date);
}

export function formatDay(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : dayFormat.format(date);
}

/**
 * Coarse "how long ago" label. The exact timestamp is always shown next to it,
 * so this only needs to give the reader a sense of recency at a glance.
 */
export function formatRelative(value: string | null | undefined, now: number) {
  if (!value) return null;

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return null;

  const diff = now - time;
  if (diff < 0) return "just now";
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(diff / DAY);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

/** The moment a submission last changed, preferring the submit time. */
export function submissionTimestamp(submission: SubmissionResponse) {
  return submission.submittedAt ?? submission.updatedAt ?? null;
}

export type SubmissionHistorySummary = {
  total: number;
  submitted: number;
  rounds: number;
  latest: string | null;
};

/**
 * Everything the summary strip shows is derived from the list already on
 * screen — no extra request, and no number the list itself cannot justify.
 */
export function summarizeSubmissions(
  submissions: SubmissionResponse[],
): SubmissionHistorySummary {
  const rounds = new Set(submissions.map((item) => item.roundId));

  let latest: string | null = null;
  let latestTime = Number.NEGATIVE_INFINITY;

  for (const submission of submissions) {
    const stamp = submissionTimestamp(submission);
    if (!stamp) continue;

    const time = new Date(stamp).getTime();
    if (!Number.isNaN(time) && time > latestTime) {
      latestTime = time;
      latest = stamp;
    }
  }

  return {
    total: submissions.length,
    submitted: submissions.filter((item) => item.status === "SUBMITTED").length,
    rounds: rounds.size,
    latest,
  };
}

export function groupFeedbackBySubmission(
  submissions: SubmissionResponse[],
  feedbacks: MentorFeedbackResponse[],
) {
  const bySubmission = new Map<string, MentorFeedbackResponse[]>(
    submissions.map((submission) => [submission.id, []]),
  );
  const submissionIdByRound = new Map(
    submissions.map((submission) => [submission.roundId, submission.id]),
  );
  const other: MentorFeedbackResponse[] = [];

  for (const feedback of feedbacks) {
    const submissionId =
      (feedback.submissionId && bySubmission.has(feedback.submissionId)
        ? feedback.submissionId
        : undefined) ??
      (feedback.roundId
        ? submissionIdByRound.get(feedback.roundId)
        : undefined);

    if (submissionId) {
      bySubmission.get(submissionId)?.push(feedback);
    } else {
      other.push(feedback);
    }
  }

  return { bySubmission, other };
}
