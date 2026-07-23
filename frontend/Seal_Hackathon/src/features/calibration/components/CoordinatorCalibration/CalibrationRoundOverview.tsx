import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import Diversity3OutlinedIcon from "@mui/icons-material/Diversity3Outlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

import type {
    CalibrationRoundDetailResponse,
    CalibrationRoundResponse,
} from "@/types/calibration.types";
import type { EventCriteriaResponse } from "@/types/criteria.types";
import type { RoundResponse } from "@/types/round.types";
import { LIFECYCLE_CONFIG } from "../../constants/calibrationUi";
import {
    formatDateRange,
    formatDuration,
    formatScore,
    formatTimeRemaining,
    getRoundLifecycle,
} from "../../utils/format";

interface CalibrationRoundOverviewProps {
    round: CalibrationRoundDetailResponse;
    /** Same round from the list endpoint (carries judge counts); optional. */
    listRound?: CalibrationRoundResponse;
    criteria: EventCriteriaResponse[];
    rounds: RoundResponse[];
}

const groupCriteria = (criteria: EventCriteriaResponse[]) => {
    const groups = [
        { title: "Technical criteria", data: criteria.filter((c) => c.effectiveIsTechnical) },
        { title: "Soft-skill criteria", data: criteria.filter((c) => !c.effectiveIsTechnical) },
    ];
    return groups.filter((g) => g.data.length > 0);
};

export const CalibrationRoundOverview = ({
    round,
    listRound,
    criteria,
    rounds,
}: CalibrationRoundOverviewProps) => {
    const lifecycle = getRoundLifecycle(round);
    const status = LIFECYCLE_CONFIG[lifecycle];
    const isPublished = lifecycle === "PUBLISHED";
    const remaining = lifecycle === "LIVE" ? formatTimeRemaining(round.endAt) : null;

    const sourceRound = rounds.find((r) => r.id === round.sampleRoundId);
    const benchmarkScores = (round.benchmarkScores ?? {}) as Record<string, number>;
    const scoredCriteria = criteria.filter((c) => benchmarkScores[c.id] !== undefined);
    const groups = groupCriteria(scoredCriteria.length > 0 ? scoredCriteria : criteria);

    const assigned = listRound?.assignedJudgeCount ?? 0;
    const submitted = listRound?.submittedJudgeCount ?? 0;
    const progressPct = assigned > 0 ? Math.round((submitted / assigned) * 100) : 0;

    const summaryCards = [
        {
            label: "Source round",
            icon: <FlagOutlinedIcon sx={{ fontSize: 17 }} />,
            value: sourceRound?.name || "Round",
            hint: round.eventName,
        },
        {
            label: "Sample submission",
            icon: <Diversity3OutlinedIcon sx={{ fontSize: 17 }} />,
            value: round.sampleTeamName || "Sample submission",
            hint: round.sampleProjectTitle || `#${round.sampleSubmissionId.slice(0, 8)}…`,
        },
        {
            label: "Scoring window",
            icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 17 }} />,
            value: formatDateRange(round.startAt, round.endAt),
            hint: remaining || formatDuration(round.startAt, round.endAt) || "Schedule not set",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Status + actions bar */}
            <div
                className="calib-fade-up flex flex-wrap items-center justify-between gap-4"
                style={{ "--calib-stagger": 1 } as React.CSSProperties}
            >
                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-wider shadow-sm ${status.pill}`}
                    >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot} ${status.pulse ? "calib-live-dot" : ""}`} />
                        {status.label}
                    </span>
                    {round.mandatory && (
                        <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-rose-600 shadow-sm dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
                            Mandatory
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {!isPublished && (
                        <Button
                            component={Link}
                            to={`/coordinator/calibrations/${round.id}/edit`}
                            variant="outlined"
                            startIcon={<EditOutlinedIcon />}
                            sx={{
                                textTransform: "none",
                                fontWeight: 800,
                                borderRadius: "12px",
                                borderColor: "#10b981",
                                color: "#059669",
                                "&:hover": { borderColor: "#059669", bgcolor: "rgba(16,185,129,0.08)" },
                            }}
                        >
                            Edit Round
                        </Button>
                    )}
                    <Button
                        component={Link}
                        to={`/coordinator/calibrations/${round.id}/distribution`}
                        variant="contained"
                        startIcon={<InsightsOutlinedIcon />}
                        className="calib-press"
                        sx={{
                            textTransform: "none",
                            fontWeight: 800,
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #10b981, #14b8a6)",
                            boxShadow: "0 10px 24px -8px rgba(16,185,129,0.5)",
                            "&:hover": { background: "linear-gradient(135deg, #059669, #0d9488)" },
                        }}
                    >
                        View Distribution
                    </Button>
                </div>
            </div>

            {/* Summary strip */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map((card, index) => (
                    <div
                        key={card.label}
                        className="calib-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                        style={{ "--calib-stagger": index + 2 } as React.CSSProperties}
                    >
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                {card.icon}
                            </span>
                            <span className="text-[11px] font-black uppercase tracking-wider">{card.label}</span>
                        </div>
                        <p className="mt-2.5 truncate text-sm font-black text-slate-900 dark:text-white" title={card.value}>
                            {card.value}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-slate-400 dark:text-slate-500">
                            {card.hint}
                        </p>
                    </div>
                ))}

                {/* Judge progress card */}
                <div
                    className="calib-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    style={{ "--calib-stagger": 5 } as React.CSSProperties}
                >
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            <GroupsOutlinedIcon sx={{ fontSize: 17 }} />
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-wider">Judge progress</span>
                    </div>
                    {listRound ? (
                        <>
                            <p className="mt-2.5 text-sm font-black tabular-nums text-slate-900 dark:text-white">
                                {submitted}/{assigned} scored
                            </p>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div
                                    className="calib-bar-grow h-full rounded-full bg-blue-500"
                                    style={{ width: `${progressPct}%` } as React.CSSProperties}
                                />
                            </div>
                            {listRound.pendingJudgeCount > 0 && (
                                <p className="mt-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                    {listRound.pendingJudgeCount} pending
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="mt-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500">
                            Not available
                        </p>
                    )}
                </div>
            </div>

            {/* Benchmark scorecard */}
            {groups.map((group, groupIndex) => (
                <section
                    key={group.title}
                    className="calib-fade-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    style={{ "--calib-stagger": groupIndex + 6 } as React.CSSProperties}
                >
                    <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <h2 className="text-base font-black text-slate-900 dark:text-white">{group.title}</h2>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Benchmark reference scores judges calibrate against.
                        </p>
                    </div>
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {group.data.map((criterion, index) => {
                            const score = benchmarkScores[criterion.id];
                            const pct =
                                score !== undefined && criterion.effectiveMaxScore > 0
                                    ? Math.round((score / criterion.effectiveMaxScore) * 100)
                                    : 0;
                            return (
                                <li key={criterion.id} className="flex items-center gap-6 px-6 py-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-black text-slate-900 dark:text-white">
                                                {criterion.effectiveName}
                                            </span>
                                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                {criterion.templateCategory || "CUSTOM"}
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                                                ×{formatScore(criterion.effectiveWeight)}
                                            </span>
                                        </div>
                                        {criterion.effectiveDescription && (
                                            <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                {criterion.effectiveDescription}
                                            </p>
                                        )}
                                        <div className="mt-2.5 h-1.5 max-w-md overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div
                                                className="calib-bar-grow h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                                style={{ width: `${pct}%`, "--calib-stagger": index } as React.CSSProperties}
                                            />
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <span className="text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                                            {score !== undefined ? formatScore(score) : "—"}
                                        </span>
                                        <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                                            {" "}/ {criterion.effectiveMaxScore}
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            ))}

        </div>
    );
};
