import type { CSSProperties } from "react";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import type { RoundGradingProgressResponse } from "@/types/grading.types";
import { formatShortDate } from "@/features/events/utils/publicEventView";
import { LockReadinessChecklist } from "./LockReadinessChecklist";

interface LockGradingPanelProps {
    round: RoundGradingProgressResponse;
    onLockClick: () => void;
    isLocking: boolean;
}

/**
 * Lock Grading command card: merges the old Alert-banner pile and lock panel
 * into one guided card — readiness checklist first, CTA second, so a disabled
 * button is always explained by the rows above it.
 */
export const LockGradingPanel = ({ round, onLockClick, isLocking }: LockGradingPanelProps) => {
    if (round.gradingLocked) {
        return (
            <section
                className="gp-settle relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 dark:border-emerald-900/60 dark:bg-emerald-900/15"
                aria-label="Grading locked"
            >
                <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                        <VerifiedOutlinedIcon />
                    </span>
                    <div>
                        <h3 className="text-lg font-black text-emerald-800 dark:text-emerald-200">
                            Grading Locked
                        </h3>
                        <p className="mt-0.5 text-sm font-semibold text-emerald-700/90 dark:text-emerald-300/90">
                            {round.gradingLockedAt
                                ? `Scores were frozen on ${formatShortDate(round.gradingLockedAt)}. `
                                : "Scores are frozen. "}
                            Judges can no longer edit or submit scores — rankings can now be calculated.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    const isLockDisabled = !round.submissionLocked || !round.canLockGrading || isLocking;
    const disabledReason = !round.submissionLocked
        ? "Lock the submission window before locking grading"
        : !round.canLockGrading
          ? round.lockWarning || "Grading cannot be locked yet"
          : "";

    return (
        <section
            className="gp-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            style={{ "--gp-stagger": 2 } as CSSProperties}
            aria-label="Lock grading"
        >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
                <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Lock Grading</h3>
                    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Freeze all judge scores for this round before ranking calculation. Once
                        locked, judges cannot edit or submit any scores.
                    </p>
                    <div className="mt-5">
                        <LockReadinessChecklist round={round} />
                    </div>
                </div>

                <div className="flex shrink-0 items-end justify-end lg:w-56 lg:flex-col lg:justify-center">
                    <Tooltip title={isLockDisabled && !isLocking ? disabledReason : ""}>
                        <span className="w-full">
                            <Button
                                variant="contained"
                                color="error"
                                size="large"
                                fullWidth
                                className="gp-press"
                                startIcon={
                                    isLocking ? (
                                        <CircularProgress size={18} color="inherit" />
                                    ) : (
                                        <LockOutlinedIcon />
                                    )
                                }
                                disabled={isLockDisabled}
                                onClick={onLockClick}
                                sx={{
                                    borderRadius: "12px",
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 800,
                                    textTransform: "none",
                                }}
                            >
                                {isLocking ? "Locking…" : "Lock Grading"}
                            </Button>
                        </span>
                    </Tooltip>
                </div>
            </div>
        </section>
    );
};
