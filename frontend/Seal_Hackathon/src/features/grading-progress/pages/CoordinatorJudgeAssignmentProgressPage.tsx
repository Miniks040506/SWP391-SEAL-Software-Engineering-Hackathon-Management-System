import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, CircularProgress, Typography } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { useJudgeAssignmentProgressQuery } from "../hooks/useGradingProgressQueries";
import { useReopenScoreSheetMutation } from "../hooks/useGradingProgressMutations";
import { GradingOverviewBand } from "../components/GradingOverviewBand";
import { SubmissionGradingProgressTable } from "../components/SubmissionGradingProgressTable";
import "../styles/gradingProgress.css";
import { useSnackbar } from "notistack";
import { isAxiosError } from "axios";
import type { UUID } from "@/types/common.types";
import type { SubmissionGradingProgressResponse } from "@/types/grading.types";
import { ActionConfirmDialog } from "@/components/common/ActionConfirmDialog";

export const CoordinatorJudgeAssignmentProgressPage = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const reopenMutation = useReopenScoreSheetMutation();
    const [scoreSheetToReopen, setScoreSheetToReopen] =
        useState<SubmissionGradingProgressResponse | null>(null);

    const {
        data: assignmentProgress,
        isLoading,
        isError,
        refetch,
        isRefetching,
    } = useJudgeAssignmentProgressQuery(assignmentId as UUID);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    if (isError || !assignmentProgress) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-4">
                <Typography color="error">Could not load judge assignment progress. Please try again.</Typography>
                <Button variant="outlined" onClick={() => refetch()}>Retry</Button>
            </div>
        );
    }

    const handleReopenScoreSheet = (submission: SubmissionGradingProgressResponse) => {
        if (!submission.roundId) {
            enqueueSnackbar("Cannot reopen scorecard because the round is missing.", { variant: "error" });
            return;
        }

        setScoreSheetToReopen(submission);
    };

    const confirmReopenScoreSheet = () => {
        if (!scoreSheetToReopen?.roundId) return;

        reopenMutation.mutate(
            {
                roundId: scoreSheetToReopen.roundId,
                submissionId: scoreSheetToReopen.submissionId,
                judgeId: assignmentProgress.judgeId,
                assignmentId: assignmentProgress.assignmentId,
            },
            {
                onSuccess: () => {
                    setScoreSheetToReopen(null);
                    enqueueSnackbar("Scorecard reopened for judge editing.", { variant: "success" });
                },
                onError: (error: unknown) => {
                    const msg = isAxiosError<{ message?: string }>(error) && error.response?.data?.message
                        ? error.response.data.message
                        : "Failed to reopen scorecard.";
                    enqueueSnackbar(msg, { variant: "error" });
                },
            },
        );
    };

    return (
        <div className="mx-auto max-w-7xl animate-in fade-in duration-500 space-y-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-950 dark:text-white">
                        {assignmentProgress.judgeName || "Unknown Judge"}
                    </h1>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <span>Email:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{assignmentProgress.judgeEmail}</span>
                        <span className="mx-2">•</span>
                        <span>Track:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{assignmentProgress.trackName || "All Tracks"}</span>
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
                        startIcon={<ArrowBackOutlinedIcon />}
                        onClick={() => navigate(-1)}
                        sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                    >
                        Back
                    </Button>
                </div>
            </header>

            <GradingOverviewBand
                percent={assignmentProgress.percent}
                completed={assignmentProgress.completedAssignedSubmissions}
                total={assignmentProgress.totalAssignedSubmissions}
                pending={assignmentProgress.pendingSubmissions}
                draft={assignmentProgress.draftSavedSubmissions}
                submitted={assignmentProgress.submittedSubmissions}
                locked={assignmentProgress.lockedSubmissions}
                tiles={[
                    {
                        label: "Confirmed scores",
                        value: `${assignmentProgress.confirmedScoreCount} / ${assignmentProgress.expectedFinalScoreCount}`,
                        hint: "Final judge scores",
                    },
                    {
                        label: "Criteria",
                        value: `${assignmentProgress.criteriaCount}`,
                        hint: "Per submission",
                    },
                ]}
            />

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Assigned Submissions</h2>
                </div>
                <SubmissionGradingProgressTable
                    submissions={assignmentProgress.submissions}
                    onReopen={handleReopenScoreSheet}
                    reopeningSubmissionId={
                        reopenMutation.isPending
                            ? reopenMutation.variables?.submissionId
                            : null
                    }
                />
            </section>
            <ActionConfirmDialog
                open={scoreSheetToReopen !== null}
                title="Reopen finalized scorecard?"
                description={`The finalized scores for ${scoreSheetToReopen?.teamName || "this team"} will become an editable draft for the assigned judge.`}
                confirmLabel="Reopen scorecard"
                onClose={() => setScoreSheetToReopen(null)}
                onConfirm={confirmReopenScoreSheet}
                isPending={reopenMutation.isPending}
            />
        </div>
    );
};
