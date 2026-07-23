import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import type { RoundGradingProgressResponse } from "@/types/grading.types";
import { formatShortDate } from "@/features/events/utils/publicEventView";

type ReadinessState = "ok" | "partial" | "blocked";

interface ChecklistRowProps {
    state: ReadinessState;
    label: string;
    detail: string;
    completed?: number;
    total?: number;
}

const STATE_STYLES: Record<ReadinessState, { iconClass: string; barClass: string }> = {
    ok: { iconClass: "text-emerald-500", barClass: "bg-emerald-500" },
    partial: { iconClass: "text-amber-500", barClass: "bg-amber-500" },
    blocked: { iconClass: "text-red-500", barClass: "bg-red-400" },
};

const ChecklistRow = ({ state, label, detail, completed, total }: ChecklistRowProps) => {
    const { iconClass, barClass } = STATE_STYLES[state];
    const showBar = typeof completed === "number" && typeof total === "number" && total > 0;
    const barPercent = showBar ? Math.min((completed! / total!) * 100, 100) : 0;

    return (
        <li className="flex items-start gap-3">
            <span className={`gp-pop mt-0.5 shrink-0 ${iconClass}`}>
                {state === "ok" ? (
                    <CheckCircleOutlinedIcon fontSize="small" />
                ) : state === "partial" ? (
                    <ErrorOutlineOutlinedIcon fontSize="small" />
                ) : (
                    <CancelOutlinedIcon fontSize="small" />
                )}
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{label}</span>
                    <span className="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                        {detail}
                    </span>
                </div>
                {showBar && (
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                            className={`gp-bar-grow h-full rounded-full ${barClass}`}
                            style={{ width: `${barPercent}%` }}
                        />
                    </div>
                )}
            </div>
        </li>
    );
};

interface LockReadinessChecklistProps {
    round: RoundGradingProgressResponse;
}

/**
 * Guided readiness checklist for the Lock Grading action. Replaces the old
 * pile of Alert banners: each precondition is a row with an animated
 * tick/cross so a disabled CTA is self-explanatory.
 */
export const LockReadinessChecklist = ({ round }: LockReadinessChecklistProps) => {
    const judgesDone =
        round.totalAssignedSubmissions > 0 &&
        round.completedAssignedSubmissions >= round.totalAssignedSubmissions;
    const scoresDone =
        round.expectedFinalScoreCount > 0 &&
        round.confirmedScoreCount >= round.expectedFinalScoreCount;

    return (
        <div>
            <ul className="space-y-4">
                <ChecklistRow
                    state={round.submissionLocked ? "ok" : "blocked"}
                    label="Submission window locked"
                    detail={
                        round.submissionLocked
                            ? round.submissionLockedAt
                                ? `Locked ${formatShortDate(round.submissionLockedAt)}`
                                : "Locked"
                            : "Lock submissions first"
                    }
                />
                <ChecklistRow
                    state={judgesDone ? "ok" : "partial"}
                    label="Judges finished scoring"
                    detail={`${round.completedAssignedSubmissions} / ${round.totalAssignedSubmissions} submissions`}
                    completed={round.completedAssignedSubmissions}
                    total={round.totalAssignedSubmissions}
                />
                <ChecklistRow
                    state={scoresDone ? "ok" : "partial"}
                    label="Final scores confirmed"
                    detail={`${round.confirmedScoreCount} / ${round.expectedFinalScoreCount} scores`}
                    completed={round.confirmedScoreCount}
                    total={round.expectedFinalScoreCount}
                />
            </ul>
            {!round.gradingLocked && round.lockWarning && (
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                    <ErrorOutlineOutlinedIcon sx={{ fontSize: 16 }} className="mt-px shrink-0" />
                    {round.lockWarning}
                </p>
            )}
        </div>
    );
};
