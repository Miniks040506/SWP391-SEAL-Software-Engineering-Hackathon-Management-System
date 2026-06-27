import { Button, LinearProgress } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import type { RoundGradingProgressResponse } from "@/types/grading.types";

interface LockGradingPanelProps {
    round: RoundGradingProgressResponse;
    onLockClick: () => void;
    isLocking: boolean;
}

export const LockGradingPanel = ({ round, onLockClick, isLocking }: LockGradingPanelProps) => {
    const isLockDisabled = !round.submissionLocked || round.gradingLocked || !round.canLockGrading || isLocking;

    const progressPercent = round.totalAssignedSubmissions > 0
        ? Math.round((round.completedAssignedSubmissions / round.totalAssignedSubmissions) * 100)
        : 0;

    const scoresPercent = round.expectedFinalScoreCount > 0
        ? Math.round((round.confirmedScoreCount / round.expectedFinalScoreCount) * 100)
        : 0;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 space-y-4">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">
                            Lock Grading
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Freeze all judge scores for this round before ranking calculation.
                            Once locked, judges cannot edit or submit any scores.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                        <div className="flex-1">
                            <div className="flex justify-between text-sm font-bold mb-1">
                                <span>Completed Submissions</span>
                                <span>{round.completedAssignedSubmissions} / {round.totalAssignedSubmissions}</span>
                            </div>
                            <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 8, borderRadius: 4 }} color="primary" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between text-sm font-bold mb-1">
                                <span>Confirmed Scores</span>
                                <span>{round.confirmedScoreCount} / {round.expectedFinalScoreCount}</span>
                            </div>
                            <LinearProgress variant="determinate" value={scoresPercent} sx={{ height: 8, borderRadius: 4 }} color="success" />
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center justify-end">
                    <Button
                        variant="contained"
                        color="error"
                        size="large"
                        startIcon={<LockOutlinedIcon />}
                        disabled={isLockDisabled}
                        onClick={onLockClick}
                        sx={{ borderRadius: "12px", px: 4, py: 1.5, fontWeight: 800, textTransform: "none" }}
                    >
                        {round.gradingLocked ? "Grading Locked" : isLocking ? "Locking..." : "Lock Grading"}
                    </Button>
                </div>
            </div>
        </div>
    );
};