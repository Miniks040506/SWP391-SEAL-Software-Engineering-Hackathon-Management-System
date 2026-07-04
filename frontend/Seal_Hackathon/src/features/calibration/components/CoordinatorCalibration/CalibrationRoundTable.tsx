import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Button } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { CalibrationRoundResponse } from "@/types/calibration.types";
import { CalibrationStatusBadge } from "../JudgeCalibration/CalibrationStatusBadge";

interface CalibrationRoundTableProps {
    rounds: CalibrationRoundResponse[];
    onPublish: (id: string) => void;
    isPublishing: string | null;
}

const formatDate = (isoString?: string | null) => {
    if (!isoString) return "N/A";
    try {
        return format(parseISO(isoString), "MMM d, yyyy HH:mm");
    } catch {
        return "Invalid Date";
    }
};

export const CalibrationRoundTable = ({
    rounds,
    onPublish,
    isPublishing,
}: CalibrationRoundTableProps) => {
    if (!rounds || rounds.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                No calibration rounds found. Create one to get started.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {rounds.map((round) => {
                const isDistributionPublished = !!round.distributionPublishedAt;

                return (
                    <div
                        key={round.id}
                        className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md md:flex-row md:items-center md:justify-between dark:border-slate-700 dark:bg-slate-900"
                    >
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {round.description || "Calibration Round"}
                            </h3>
                            <CalibrationStatusBadge
                                distributionPublished={isDistributionPublished}
                                mandatory={round.mandatory}
                            />
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Sample Submission:{" "}
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    {round.sampleSubmissionId}
                                </span>
                            </p>
                            <div className="mt-3 flex items-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                <p>Start: {formatDate(round.startAt)}</p>
                                <p>End: {formatDate(round.endAt)}</p>
                                <p>
                                    Judge scores: {round.submittedJudgeCount} / {round.assignedJudgeCount}
                                </p>
                                {round.pendingJudgeCount > 0 && (
                                    <p className="text-amber-600 dark:text-amber-400">
                                        {round.pendingJudgeCount} pending
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                component={Link}
                                to={`/coordinator/calibrations/${round.id}`}
                                variant="outlined"
                                color="inherit"
                                size="small"
                                startIcon={<VisibilityOutlinedIcon />}
                                sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}
                            >
                                View
                            </Button>

                            {!isDistributionPublished && (
                                <>
                                    <Button
                                        component={Link}
                                        to={`/coordinator/calibrations/${round.id}/edit`}
                                        variant="outlined"
                                        color="warning"
                                        size="small"
                                        startIcon={<EditOutlinedIcon />}
                                        sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        startIcon={<PublishOutlinedIcon />}
                                        onClick={() => onPublish(round.id)}
                                        disabled={isPublishing === round.id}
                                        sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}
                                    >
                                        {isPublishing === round.id ? "Publishing..." : "Publish"}
                                    </Button>
                                </>
                            )}

                            <Button
                                component={Link}
                                to={`/coordinator/calibrations/${round.id}/distribution`}
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}
                            >
                                Distribution
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
