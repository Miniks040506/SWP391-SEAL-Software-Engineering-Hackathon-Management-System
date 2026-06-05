export function statusAllowsEventCriteriaEdit(status?: string | null) {
  const normalized = (status || "DRAFT").toUpperCase();
  return !["JUDGING", "COMPLETED", "CANCELLED"].includes(normalized);
}

export function getEventCriteriaReadonlyReason(status?: string | null) {
  const normalized = (status || "DRAFT").toUpperCase();
  if (normalized === "JUDGING") {
    return "Event is in JUDGING, so event criteria are locked by backend rules.";
  }
  if (normalized === "COMPLETED") {
    return "Event is COMPLETED, so event criteria are read-only.";
  }
  if (normalized === "CANCELLED") {
    return "Event is CANCELLED, so event criteria are read-only.";
  }
  return "";
}
