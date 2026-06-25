import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, CircularProgress, Typography, Alert } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { useRoundGradingProgressQuery } from "../hooks/useGradingProgressQueries";
import { useLockRoundGradingMutation } from "../hooks/useGradingProgressMutations";
import { GradingProgressSummaryCards } from "../components/GradingProgressSummaryCards";
import { JudgeAssignmentProgressTable } from "../components/JudgeAssignmentProgressTable";
import { LockGradingPanel } from "../components/LockGradingPanel";
import { LockGradingConfirmDialog } from "../components/LockGradingConfirmDialog";
import { useSnackbar } from "notistack";
import type { UUID } from "@/types/common.types";
import { formatShortDate } from '@/features/events/utils/publicEventView';

export const CoordinatorRoundGradingProgressPage = () => {
    const { roundId } = useParams<{ roundId: string }>();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const {
        data: roundProgress,
        isLoading,
        isError,
        refetch,
        isRefetching,
    } = useRoundGradingProgressQuery(roundId as UUID);

    const lockMutation = useLockRoundGradingMutation();

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    if (isError || !roundProgress) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-4">
                <Typography color="error">Could not load round progress. Please try again.</Typography>
                <Button variant="outlined" onClick={() => refetch()}>Retry</Button>
            </div>
        );
    }

    const handleLockConfirm = () => {
        lockMutation.mutate(roundId as UUID, {
            onSuccess: () => {
                enqueueSnackbar("Grading locked successfully.", { variant: "success" });
                setConfirmOpen(false);
            },
            onError: (err: any) => {
                const msg = err?.response?.data?.message || "Failed to lock grading";
                enqueueSnackbar(msg, { variant: "error" });
                setConfirmOpen(false);
            }
        });
    };

    const isIncomplete =
        roundProgress.completedAssignedSubmissions < roundProgress.totalAssignedSubmissions ||
        roundProgress.confirmedScoreCount < roundProgress.expectedFinalScoreCount;

    return (
        <div className="mx-auto max-w-7xl animate-in fade-in duration-500 space-y-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-950 dark:text-white">
                        {roundProgress.roundName}
                    </h1>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <span>Event:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{roundProgress.eventId}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Status: {roundProgress.roundStatus}
                        </span>
                        {roundProgress.submissionLockedAt && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                Submissions Locked: {formatShortDate(roundProgress.submissionLockedAt)}
                            </span>
                        )}
                        {roundProgress.gradingLockedAt && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                Grading Locked: {formatShortDate(roundProgress.gradingLockedAt)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<RefreshOutlinedIcon />}
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackOutlinedIcon />}
                        onClick={() => navigate(`/coordinator/events/${roundProgress.eventId}/grading-progress`)}
                        sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                    >
                        Back to Event
                    </Button>
                </div>
            </header>

            {/* Banners */}
            <div className="space-y-3">
                {!roundProgress.submissionLocked && (
                    <Alert severity="warning" sx={{ borderRadius: "12px", fontWeight: 600 }}>
                        Submissions must be locked before grading can be locked.
                    </Alert>
                )}
                {!roundProgress.canLockGrading && roundProgress.lockWarning && (
                    <Alert severity="error" sx={{ borderRadius: "12px", fontWeight: 600 }}>
                        {roundProgress.lockWarning}
                    </Alert>
                )}
                {roundProgress.gradingLocked && (
                    <Alert severity="info" sx={{ borderRadius: "12px", fontWeight: 600, bgcolor: "info.light", color: "info.contrastText" }}>
                        Grading is locked. Judges can no longer edit scores.
                    </Alert>
                )}
                {!roundProgress.gradingLocked && roundProgress.canLockGrading && isIncomplete && (
                    <Alert severity="warning" sx={{ borderRadius: "12px", fontWeight: 600 }}>
                        Some judges have not submitted final scores yet. You may still lock grading if allowed.
                    </Alert>
                )}
            </div>

            <GradingProgressSummaryCards
                percent={roundProgress.percent}
                totalAssignedSubmissions={roundProgress.totalAssignedSubmissions}
                completedAssignedSubmissions={roundProgress.completedAssignedSubmissions}
                pendingSubmissions={roundProgress.pendingSubmissions}
                draftSavedSubmissions={roundProgress.draftSavedSubmissions}
                lockedSubmissions={roundProgress.lockedSubmissions}
            />

            <LockGradingPanel
                round={roundProgress}
                onLockClick={() => setConfirmOpen(true)}
                isLocking={lockMutation.isPending}
            />

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Judge Assignments</h2>
                </div>
                <JudgeAssignmentProgressTable assignments={roundProgress.judgeAssignments} />
            </section>

            <LockGradingConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleLockConfirm}
                round={roundProgress}
                isLocking={lockMutation.isPending}
            />
        </div>
    );
};