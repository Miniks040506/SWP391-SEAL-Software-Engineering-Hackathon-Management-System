export type EditableEventStatus =
  | "DRAFT"
  | "REGISTRATION"
  | "ONGOING"
  | "JUDGING"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED";

export const EVENT_STATUS_STEPS: Array<{
  value: EditableEventStatus;
  label: string;
  description: string;
}> = [
  {
    value: "DRAFT",
    label: "Draft",
    description:
      "Coordinator prepares event information, tracks, rounds, mentors, judges, and prizes.",
  },
  {
    value: "REGISTRATION",
    label: "Registration",
    description:
      "Teams can register. Tracks and rounds may still be adjusted before the event starts.",
  },
  {
    value: "ONGOING",
    label: "Ongoing",
    description:
      "The hackathon is running. Track and round structure is locked.",
  },
  {
    value: "JUDGING",
    label: "Judging",
    description:
      "Submissions are locked and judges complete scorecards. Editing is locked.",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    description: "Final results are ready. The event is read-only.",
  },
];

export function normalizeEventStatus(
  status?: string | null,
): EditableEventStatus {
  const value = (status || "DRAFT").trim().toUpperCase();

  if (
    value === "DRAFT" ||
    value === "REGISTRATION" ||
    value === "ONGOING" ||
    value === "JUDGING" ||
    value === "COMPLETED" ||
    value === "CANCELLED" ||
    value === "ARCHIVED"
  ) {
    return value;
  }

  return "DRAFT";
}

export function getNextEventStatus(status: EditableEventStatus) {
  if (status === "DRAFT") return "REGISTRATION";
  if (status === "REGISTRATION") return "ONGOING";
  if (status === "ONGOING") return "JUDGING";
  if (status === "JUDGING") return "COMPLETED";
  return null;
}

export function getEventEditRules(status: EditableEventStatus) {
  const isDraft = status === "DRAFT";
  const isRegistration = status === "REGISTRATION";
  const isOngoing = status === "ONGOING";
  const isJudging = status === "JUDGING";
  const isCompleted = status === "COMPLETED";
  const isCancelled = status === "CANCELLED";
  const isArchived = status === "ARCHIVED";

  return {
    canEditInfo: isDraft || isRegistration || isOngoing,
    canEditTracksRounds: isDraft || isRegistration,
    canOperateRounds: isOngoing,
    canEditAssignments: isDraft || isRegistration || isOngoing,
    canEditPrizes: isDraft || isRegistration || isOngoing,
    canEditCriteria: isDraft || isRegistration || isOngoing,
    canAdvance: isDraft || isRegistration || isJudging,
    advanceReason: isOngoing
      ? "Lock submissions for the final round to move the event to JUDGING."
      : "",
    canCancel: isDraft || isRegistration || isOngoing || isJudging,
    isReadOnly: isJudging || isCompleted || isCancelled || isArchived,
    trackRoundReason: isOngoing
      ? "Event is ONGOING, so tracks and rounds are locked."
      : isJudging
        ? "Event is in JUDGING, so tracks and rounds cannot be edited."
        : isCompleted
          ? "Event is COMPLETED, so tracks and rounds are read-only."
          : isCancelled
            ? "Event is CANCELLED, so tracks and rounds are read-only."
            : isArchived
              ? "Event is ARCHIVED, so tracks and rounds are read-only."
              : "",
    roundOperationReason:
      isDraft || isRegistration
        ? "Start the event before opening or closing rounds."
        : isJudging
          ? "The event is in JUDGING, so round operations are closed."
          : isCompleted
            ? "The event is COMPLETED, so round operations are closed."
            : isCancelled
              ? "The event is CANCELLED, so round operations are unavailable."
              : isArchived
                ? "The event is ARCHIVED, so round operations are unavailable."
                : "",
    assignmentReason: isJudging
      ? "Event is in JUDGING, so mentor and judge assignments are locked."
      : isCompleted
        ? "Event is COMPLETED, so assignments are read-only."
        : isCancelled
          ? "Event is CANCELLED, so assignments are read-only."
          : isArchived
            ? "Event is ARCHIVED, so assignments are read-only."
            : "",
    prizeReason: isJudging
      ? "Event is in JUDGING, so prize configuration is locked."
      : isCompleted
        ? "Event is COMPLETED, so prizes are read-only."
        : isCancelled
          ? "Event is CANCELLED, so prizes are read-only."
          : isArchived
            ? "Event is ARCHIVED, so prizes are read-only."
            : "",
    criteriaReason: isJudging
      ? "Event is in JUDGING, so event criteria cannot be edited."
      : isCompleted
        ? "Event is COMPLETED, so event criteria are read-only."
        : isCancelled
          ? "Event is CANCELLED, so event criteria are read-only."
          : isArchived
            ? "Event is ARCHIVED, so event criteria are read-only."
            : "",
    infoReason: isJudging
      ? "Event is in JUDGING, so event information is locked."
      : isCompleted
        ? "Event is COMPLETED, so event information is read-only."
        : isCancelled
          ? "Event is CANCELLED, so event information is read-only."
          : isArchived
            ? "Event is ARCHIVED, so event information is read-only."
            : "",
  };
}
