import { useParams, useNavigate } from "react-router-dom";
import { Button, CircularProgress, Typography } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { useEventGradingProgressQuery } from "../hooks/useGradingProgressQueries";
import { GradingProgressSummaryCards } from "../components/GradingProgressSummaryCards";
import { RoundGradingProgressTable } from "../components/RoundGradingProgressTable";
import type { UUID } from "@/types/common.types";

export const CoordinatorEventGradingProgressPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();

    const {
        data: eventProgress,
        isLoading,
        isError,
        refetch,
        isRefetching,
    } = useEventGradingProgressQuery(eventId as UUID, "ONGOING"); // Defaulting status check, hook handles internal

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    if (isError || !eventProgress) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-4">
                <Typography color="error">Could not load grading progress. Please try again.</Typography>
                <Button variant="outlined" onClick={() => refetch()}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl animate-in fade-in duration-500 space-y-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-950 dark:text-white">
                        Grading Progress
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
                        Monitor judge scoring progress before locking grading.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <span>Coordinator</span>
                        <span>/</span>
                        <span>Events</span>
                        <span>/</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{eventProgress.eventName}</span>
                        <span>/</span>
                        <span className="font-semibold text-slate-900 dark:text-white">Grading Progress</span>
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
                        onClick={() => navigate(`/coordinator/events/${eventId}/edit`)}
                        sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                    >
                        Back to Event
                    </Button>
                </div>
            </header>

            <GradingProgressSummaryCards
                percent={eventProgress.percent}
                totalAssignedSubmissions={eventProgress.totalAssignedSubmissions}
                completedAssignedSubmissions={eventProgress.completedAssignedSubmissions}
                pendingSubmissions={eventProgress.pendingSubmissions}
                draftSavedSubmissions={eventProgress.draftSavedSubmissions}
                lockedSubmissions={eventProgress.lockedSubmissions}
            />

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Rounds</h2>
                </div>
                <RoundGradingProgressTable rounds={eventProgress.rounds} />
            </section>
        </div>
    );
};
