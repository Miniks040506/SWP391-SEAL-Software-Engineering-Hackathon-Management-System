import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Tooltip } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import type { UUID } from "@/types/common.types";
import type { RoundGradingProgressResponse } from "@/types/grading.types";
import { formatShortDate } from "@/features/events/utils/publicEventView";
import {
    formatProgressPercent,
    normalizeProgressPercent,
} from "../utils/gradingProgressFormat";

const ROUND_STATUS_STYLES: Record<string, string> = {
    OPEN: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
    JUDGING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    CLOSED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const roundStatusClass = (status: string) =>
    ROUND_STATUS_STYLES[status] ??
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

interface LockPillProps {
    locked: boolean;
    lockedAt?: string | null;
    label: string;
}

const LockPill = ({ locked, lockedAt, label }: LockPillProps) => (
    <Tooltip
        title={
            locked
                ? `${label} locked${lockedAt ? ` on ${formatShortDate(lockedAt)}` : ""}`
                : `${label} still open`
        }
    >
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                locked
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300"
            }`}
        >
            {locked ? (
                <LockOutlinedIcon sx={{ fontSize: 13 }} />
            ) : (
                <LockOpenOutlinedIcon sx={{ fontSize: 13 }} />
            )}
            {label}
        </span>
    </Tooltip>
);

interface RoundGradingProgressTableProps {
    rounds: RoundGradingProgressResponse[];
    eventId?: UUID;
}

/**
 * Round progress as clickable row-cards: lifecycle chip, lock pills,
 * full-width animated progress bar (sheen while judging) and a View action.
 */
export const RoundGradingProgressTable = ({ rounds = [], eventId }: RoundGradingProgressTableProps) => {
    const navigate = useNavigate();

    if (rounds.length === 0) {
        return (
            <div className="gp-fade-up flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                    <GavelOutlinedIcon />
                </span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    No grading assignments yet
                </p>
                <p className="max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">
                    Assign judges to this event's rounds before monitoring grading progress.
                </p>
                {eventId && (
                    <Button
                        component={Link}
                        to={`/coordinator/events/${eventId}/edit`}
                        variant="outlined"
                        sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none", mt: 1 }}
                    >
                        Assign judges
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {rounds.map((round, index) => {
                const isJudgingLive = round.roundStatus === "JUDGING" && !round.gradingLocked;
                const percent = normalizeProgressPercent(round.percent);

                return (
                    <div
                        key={round.roundId}
                        role="link"
                        tabIndex={0}
                        aria-label={`Open grading progress for ${round.roundName}`}
                        onClick={() => navigate(`/coordinator/rounds/${round.roundId}/grading-progress`)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                navigate(`/coordinator/rounds/${round.roundId}/grading-progress`);
                            }
                        }}
                        className={`gp-fade-up gp-lift group cursor-pointer rounded-2xl border bg-white p-5 shadow-sm outline-none transition-colors hover:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-slate-900 dark:hover:border-blue-700 ${
                            isJudgingLive
                                ? "gp-judging-glow border-amber-200 dark:border-amber-900/60"
                                : "border-slate-200 dark:border-slate-700"
                        }`}
                        style={{ "--gp-stagger": index + 3 } as CSSProperties}
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                            <div className="min-w-0 lg:w-72 lg:shrink-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="truncate text-base font-black text-slate-900 dark:text-white">
                                        {round.roundName}
                                    </h3>
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${roundStatusClass(round.roundStatus)}`}
                                    >
                                        {isJudgingLive && (
                                            <span className="gp-live-dot inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                                        )}
                                        {round.roundStatus}
                                    </span>
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                    <LockPill
                                        locked={round.submissionLocked}
                                        lockedAt={round.submissionLockedAt}
                                        label="Submissions"
                                    />
                                    <LockPill
                                        locked={round.gradingLocked}
                                        lockedAt={round.gradingLockedAt}
                                        label="Grading"
                                    />
                                </div>
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                                        <GroupsOutlinedIcon sx={{ fontSize: 15 }} />
                                        {round.judgeAssignmentCount}{" "}
                                        {round.judgeAssignmentCount === 1 ? "judge" : "judges"}
                                    </span>
                                    <span className="text-sm font-black tabular-nums text-slate-900 dark:text-white">
                                        {round.completedAssignedSubmissions}
                                        <span className="font-bold text-slate-400 dark:text-slate-500">
                                            {" "}/ {round.totalAssignedSubmissions}
                                        </span>
                                        <span className="ml-2 text-blue-600 dark:text-blue-400">
                                            {formatProgressPercent(round.percent)}%
                                        </span>
                                    </span>
                                </div>
                                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                    <div
                                        className={`gp-bar-grow h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 ${
                                            isJudgingLive ? "gp-bar-sheen" : ""
                                        }`}
                                        style={
                                            {
                                                width: `${percent}%`,
                                                "--gp-stagger": index + 3,
                                            } as CSSProperties
                                        }
                                    />
                                </div>
                            </div>

                            <div className="shrink-0 lg:pl-2">
                                <Button
                                    component={Link}
                                    to={`/coordinator/rounds/${round.roundId}/grading-progress`}
                                    onClick={(e) => e.stopPropagation()}
                                    size="small"
                                    variant="outlined"
                                    endIcon={<ArrowForwardOutlinedIcon />}
                                    sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
                                >
                                    View
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
