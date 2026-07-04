import { useParams, useNavigate } from "react-router-dom";
import { Button, CircularProgress, Typography } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { useJudgeAssignmentProgressQuery } from "../hooks/useGradingProgressQueries";
import { useReopenScoreSheetMutation } from "../hooks/useGradingProgressMutations";
import { GradingProgressSummaryCards } from "../components/GradingProgressSummaryCards";
import { SubmissionGradingProgressTable } from "../components/SubmissionGradingProgressTable";
import { useSnackbar } from "notistack";
import type { UUID } from "@/types/common.types";
import type { SubmissionGradingProgressResponse } from "@/types/grading.types";

export const CoordinatorJudgeAssignmentProgressPage = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const reopenMutation = useReopenScoreSheetMutation();

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

        if (!window.confirm(`Reopen ${submission.teamName || "this team's"} scorecard for editing?`)) {
            return;
        }

        reopenMutation.mutate(
            {
                roundId: submission.roundId,
                submissionId: submission.submissionId,
                judgeId: assignmentProgress.judgeId,
                assignmentId: assignmentProgress.assignmentId,
            },
            {
                onSuccess: () => {
                    enqueueSnackbar("Scorecard reopened for judge editing.", { variant: "success" });
                },
                onError: (err: any) => {
                    const msg = err?.response?.data?.message || "Failed to reopen scorecard.";
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

            <GradingProgressSummaryCards
                percent={assignmentProgress.percent}
                totalAssignedSubmissions={assignmentProgress.totalAssignedSubmissions}
                completedAssignedSubmissions={assignmentProgress.completedAssignedSubmissions}
                pendingSubmissions={assignmentProgress.pendingSubmissions}
                draftSavedSubmissions={assignmentProgress.draftSavedSubmissions}
                lockedSubmissions={assignmentProgress.lockedSubmissions}
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
        </div>
    );
};
