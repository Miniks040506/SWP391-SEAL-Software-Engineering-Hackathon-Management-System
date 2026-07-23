import { Link } from "react-router-dom";
import { Button, Tooltip } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

import type { CalibrationRoundResponse } from "@/types/calibration.types";
import { LIFECYCLE_CONFIG } from "../../constants/calibrationUi";
import {
    formatDateRange,
    formatTimeRemaining,
    getRoundLifecycle,
} from "../../utils/format";

interface CalibrationRoundCardProps {
    round: CalibrationRoundResponse;
    index: number;
    onPublish: (id: string) => void;
    isPublishing: boolean;
}

export const CalibrationRoundCard = ({
    round,
    index,
    onPublish,
    isPublishing,
}: CalibrationRoundCardProps) => {
    const lifecycle = getRoundLifecycle(round);
    const status = LIFECYCLE_CONFIG[lifecycle];
    const isPublished = lifecycle === "PUBLISHED";
    const isLive = lifecycle === "LIVE";

    const assigned = round.assignedJudgeCount;
    const submitted = round.submittedJudgeCount;
    const progressPct = assigned > 0 ? Math.round((submitted / assigned) * 100) : 0;
    const remaining = isLive ? formatTimeRemaining(round.endAt) : null;

    const sampleLabel = round.sampleTeamName
        ? `${round.sampleTeamName}${round.sampleProjectTitle ? ` · ${round.sampleProjectTitle}` : ""}`
        : "Sample submission";

    return (
        <div
            className={`calib-fade-up calib-lift rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-900 ${
                isLive
                    ? "calib-live-card border-emerald-300/80 dark:border-emerald-500/40"
                    : "border-slate-200 hover:shadow-md dark:border-slate-700"
            }`}
            style={{ "--calib-stagger": index } as React.CSSProperties}
        >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                {/* Identity */}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm ${status.pill}`}
                        >
                            <span
                                className={`h-1.5 w-1.5 rounded-full ${status.dot} ${status.pulse ? "calib-live-dot" : ""}`}
                            />
                            {status.label}
                        </span>
                        {round.mandatory && (
                            <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-rose-600 shadow-sm dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
                                Mandatory
                            </span>
                        )}
                    </div>
                    <h3 className="mt-2.5 truncate text-lg font-black text-slate-900 dark:text-white">
                        {round.description || "Calibration Round"}
                    </h3>
                    <Tooltip title={`Submission ${round.sampleSubmissionId.slice(0, 8)}…`} placement="bottom-start">
                        <p className="mt-1 max-w-full cursor-default truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                            {round.eventName} · {sampleLabel}
                        </p>
                    </Tooltip>
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarMonthOutlinedIcon sx={{ fontSize: 15 }} />
                            {formatDateRange(round.startAt, round.endAt)}
                        </span>
                        {remaining && (
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                {remaining}
                            </span>
                        )}
                    </div>
                </div>

                {/* Judge progress */}
                <div className="w-full shrink-0 lg:w-56">
                    <div className="flex items-center justify-between text-xs font-bold">
                        <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <GroupsOutlinedIcon sx={{ fontSize: 15 }} />
                            Judge scores
                        </span>
                        <span className="tabular-nums text-slate-700 dark:text-slate-200">
                            {submitted}/{assigned}
                        </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                            className="calib-bar-grow h-full rounded-full bg-blue-500"
                            style={{ width: `${progressPct}%`, "--calib-stagger": index } as React.CSSProperties}
                        />
                    </div>
                    <p className="mt-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        {round.pendingJudgeCount > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400">
                                {round.pendingJudgeCount} judge{round.pendingJudgeCount > 1 ? "s" : ""} pending
                            </span>
                        ) : (
                            "All judges scored"
                        )}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button
                        component={Link}
                        to={`/coordinator/calibrations/${round.id}`}
                        size="small"
                        color="inherit"
                        startIcon={<VisibilityOutlinedIcon />}
                        sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", color: "text.secondary" }}
                    >
                        View
                    </Button>
                    {!isPublished && (
                        <Button
                            component={Link}
                            to={`/coordinator/calibrations/${round.id}/edit`}
                            size="small"
                            color="inherit"
                            startIcon={<EditOutlinedIcon />}
                            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", color: "text.secondary" }}
                        >
                            Edit
                        </Button>
                    )}
                    <Button
                        component={Link}
                        to={`/coordinator/calibrations/${round.id}/distribution`}
                        variant="outlined"
                        size="small"
                        startIcon={<InsightsOutlinedIcon />}
                        sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            borderRadius: "10px",
                            borderColor: "#10b981",
                            color: "#059669",
                            "&:hover": { borderColor: "#059669", bgcolor: "rgba(16,185,129,0.08)" },
                        }}
                    >
                        Distribution
                    </Button>
                    {!isPublished && (
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<PublishOutlinedIcon />}
                            onClick={() => onPublish(round.id)}
                            disabled={isPublishing}
                            className="calib-press"
                            sx={{
                                textTransform: "none",
                                fontWeight: 800,
                                borderRadius: "10px",
                                bgcolor: "#059669",
                                "&:hover": { bgcolor: "#047857" },
                            }}
                        >
                            {isPublishing ? "Publishing…" : "Publish"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
