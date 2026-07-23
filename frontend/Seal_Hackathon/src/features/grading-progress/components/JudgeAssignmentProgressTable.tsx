import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Button, Tooltip } from "@mui/material";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import type { UUID } from "@/types/common.types";
import type { JudgeAssignmentProgressResponse } from "@/types/grading.types";
import { avatarColor } from "@/utils/avatarColor";
import { GradingStatusBadge } from "./GradingStatusBadge";
import { StatusSegmentBar } from "./StatusSegmentBar";
import { formatProgressPercent } from "../utils/gradingProgressFormat";

const judgeTypeClass = (type?: string | null) =>
    type === "GUEST"
        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";

interface JudgeAssignmentProgressTableProps {
    assignments: JudgeAssignmentProgressResponse[];
}

/**
 * Judge assignment progress as expandable rows. The collapsed row keeps
 * judge identity + one progress bar + a status distribution bar; expanding
 * reveals the per-submission breakdown (team, status, confirmed criteria)
 * so the coordinator can see exactly which team a judge is stuck on.
 * Default sort: least-complete first (most actionable on top).
 */
export const JudgeAssignmentProgressTable = ({ assignments = [] }: JudgeAssignmentProgressTableProps) => {
    const [expanded, setExpanded] = useState<Set<UUID>>(new Set());

    const sortedAssignments = useMemo(
        () => [...assignments].sort((a, b) => a.percent - b.percent),
        [assignments],
    );

    const toggle = (assignmentId: UUID) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(assignmentId)) {
                next.delete(assignmentId);
            } else {
                next.add(assignmentId);
            }
            return next;
        });
    };

    if (assignments.length === 0) {
        return (
            <div className="gp-fade-up flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                    <PersonOffOutlinedIcon />
                </span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    No judges assigned to this round yet
                </p>
                <p className="max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">
                    Assign judges from the event workspace to start tracking their grading progress.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {sortedAssignments.map((assignment, index) => {
                const isOpen = expanded.has(assignment.assignmentId);
                const judgeName = assignment.judgeName || "Unknown Judge";
                const initial = judgeName.charAt(0).toUpperCase() || "?";
                const hasSubmissions = assignment.submissions.length > 0;

                return (
                    <div
                        key={assignment.assignmentId}
                        className="gp-fade-up rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                        style={{ "--gp-stagger": index + 4 } as CSSProperties}
                    >
                        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
                            <div className="flex min-w-0 items-center gap-3 lg:w-72 lg:shrink-0">
                                <span
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${avatarColor(initial)}`}
                                    aria-hidden="true"
                                >
                                    {initial}
                                </span>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="truncate text-sm font-black text-slate-900 dark:text-white">
                                            {judgeName}
                                        </span>
                                        <span
                                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${judgeTypeClass(assignment.judgeType)}`}
                                        >
                                            {assignment.judgeType || "JUDGE"}
                                        </span>
                                    </div>
                                    <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {assignment.judgeEmail}
                                    </p>
                                    {assignment.trackName && (
                                        <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                            {assignment.trackName}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                        Progress
                                    </span>
                                    <span className="text-sm font-black tabular-nums text-slate-900 dark:text-white">
                                        {assignment.completedAssignedSubmissions}
                                        <span className="font-bold text-slate-400 dark:text-slate-500">
                                            {" "}/ {assignment.totalAssignedSubmissions}
                                        </span>
                                        <span className="ml-2 text-blue-600 dark:text-blue-400">
                                            {formatProgressPercent(assignment.percent)}%
                                        </span>
                                    </span>
                                </div>
                                <Tooltip
                                    title={`Pending ${assignment.pendingSubmissions} · Draft ${assignment.draftSavedSubmissions} · Submitted ${assignment.submittedSubmissions} · Locked ${assignment.lockedSubmissions}`}
                                >
                                    <div className="mt-1.5">
                                        <StatusSegmentBar
                                            pending={assignment.pendingSubmissions}
                                            draft={assignment.draftSavedSubmissions}
                                            submitted={assignment.submittedSubmissions}
                                            locked={assignment.lockedSubmissions}
                                            size="sm"
                                            showLegend={false}
                                            stagger={index + 4}
                                        />
                                    </div>
                                </Tooltip>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5 lg:pl-2">
                                <Button
                                    component={Link}
                                    to={`/coordinator/judge-assignments/${assignment.assignmentId}/progress`}
                                    size="small"
                                    variant="outlined"
                                    startIcon={<VisibilityOutlinedIcon />}
                                    sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
                                >
                                    View
                                </Button>
                                {hasSubmissions && (
                                    <Tooltip title={isOpen ? "Hide submissions" : "Show submissions"}>
                                        <button
                                            type="button"
                                            onClick={() => toggle(assignment.assignmentId)}
                                            aria-expanded={isOpen}
                                            aria-label={`${isOpen ? "Hide" : "Show"} submissions for ${judgeName}`}
                                            className="gp-press flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                        >
                                            <ExpandMoreOutlinedIcon
                                                className={`gp-chevron ${isOpen ? "gp-open" : ""}`}
                                            />
                                        </button>
                                    </Tooltip>
                                )}
                            </div>
                        </div>

                        {hasSubmissions && (
                            <div className={`gp-collapse ${isOpen ? "gp-open" : ""}`}>
                                <div>
                                    <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
                                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                            {assignment.submissions.map((submission) => (
                                                <div
                                                    key={submission.submissionId}
                                                    className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60"
                                                >
                                                    <span className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">
                                                        {submission.teamName || "Unknown team"}
                                                    </span>
                                                    <span className="flex shrink-0 items-center gap-2">
                                                        <span className="text-[11px] font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                                                            {submission.confirmedScoreCount}/{submission.criteriaCount}
                                                        </span>
                                                        <GradingStatusBadge status={submission.gradingStatus} />
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
