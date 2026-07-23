import { format, parseISO } from "date-fns";
import type { CalibrationRoundResponse } from "@/types/calibration.types";

/** Round lifecycle derived client-side from schedule + publish timestamps. */
export type CalibrationLifecycle =
    | "DRAFT"
    | "UPCOMING"
    | "LIVE"
    | "ENDED"
    | "PUBLISHED";

/** Rounds floats coming from the API (e.g. 8.199999809265137) to a clean display value. */
export const formatScore = (value: number | null | undefined, digits = 1): string => {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    const rounded = Number(value.toFixed(digits));
    // Drop trailing ".0" for whole numbers so 8.0 renders as 8.
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(digits);
};

export const formatDateTime = (iso?: string | null): string => {
    if (!iso) return "Not set";
    try {
        return format(parseISO(iso), "MMM d, HH:mm");
    } catch {
        return "Invalid date";
    }
};

export const formatDateRange = (startAt?: string | null, endAt?: string | null): string =>
    `${formatDateTime(startAt)} → ${formatDateTime(endAt)}`;

/** Human duration between two ISO instants, e.g. "2 days 8 hours" / "5 hours". */
export const formatDuration = (startAt?: string | null, endAt?: string | null): string | null => {
    if (!startAt || !endAt) return null;
    const start = new Date(startAt).getTime();
    const end = new Date(endAt).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
    const totalMinutes = Math.round((end - start) / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    const parts: string[] = [];
    if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
    if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (!days && minutes) parts.push(`${minutes} min`);
    return parts.length ? parts.join(" ") : "under a minute";
};

/** "Ends in 6h" style countdown for live rounds. */
export const formatTimeRemaining = (endAt?: string | null): string | null => {
    if (!endAt) return null;
    const remaining = new Date(endAt).getTime() - Date.now();
    if (Number.isNaN(remaining) || remaining <= 0) return null;
    const totalHours = Math.floor(remaining / 3600000);
    const days = Math.floor(totalHours / 24);
    if (days >= 1) return `Ends in ${days}d ${totalHours % 24}h`;
    if (totalHours >= 1) return `Ends in ${totalHours}h`;
    return `Ends in ${Math.max(1, Math.floor(remaining / 60000))}m`;
};

/**
 * Derives the round lifecycle. Published always wins; otherwise the schedule decides.
 * A round without a schedule is a draft still being set up.
 */
export const getRoundLifecycle = (
    round: Pick<CalibrationRoundResponse, "startAt" | "endAt" | "distributionPublishedAt">,
): CalibrationLifecycle => {
    if (round.distributionPublishedAt) return "PUBLISHED";
    if (!round.startAt) return "DRAFT";
    const now = Date.now();
    const start = new Date(round.startAt).getTime();
    if (now < start) return "UPCOMING";
    if (round.endAt && now > new Date(round.endAt).getTime()) return "ENDED";
    return "LIVE";
};

/** 3-tier consensus classification used across the distribution views. */
export type VarianceTier = "low" | "medium" | "high" | "none";

export const getVarianceTier = (stdDev: number | null | undefined): VarianceTier => {
    if (stdDev === null || stdDev === undefined || Number.isNaN(stdDev)) return "none";
    if (stdDev < 1.0) return "low";
    if (stdDev < 2.0) return "medium";
    return "high";
};
