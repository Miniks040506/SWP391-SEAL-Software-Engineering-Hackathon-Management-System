import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Alert, Button, CircularProgress } from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import { useRoundGradingProgressQuery } from "@/features/grading-progress/hooks/useGradingProgressQueries";
import { useCoordinatorEventTracksQuery } from "@/features/coordinator/hooks/useCoordinatorEventQueries";
import { useRoundRankingsQuery } from "../hooks/useRankingQueries";
import { useCalculateRoundRankingMutation, usePublishRoundResultsMutation } from "../hooks/useRankingMutations";
import type { PublishResultsRequest } from "@/types/ranking.types";

import { CalculateRankingPanel } from "../components/CalculateRankingPanel";
import { RankingFilterBar } from "../components/RankingFilterBar";
import { RankingPodium } from "../components/RankingPodium";
import { RankingTable } from "../components/RankingTable";
import { MobileRankingCard } from "../components/MobileRankingCard";
import { PublishResultsDialog } from "../components/PublishResultsDialog";

type SelectOption = { id: string; name: string };

export const CoordinatorRoundRankingPage = () => {
    const { roundId } = useParams<{ roundId: string }>();
    const navigate = useNavigate();

    const [selectedTrackId, setSelectedTrackId] = useState<string>("all");
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);
    const [showRecalculationBanner, setShowRecalculationBanner] = useState(
        () => sessionStorage.getItem("rankingRecalculated") === "true"
    );

    const handleCloseBanner = () => {
        setShowRecalculationBanner(false);
        sessionStorage.removeItem("rankingRecalculated");
    };

    const { data: roundInfo, isLoading: isLoadingInfo } = useRoundGradingProgressQuery(roundId);

    const { data: tracks = [] } = useCoordinatorEventTracksQuery(roundInfo?.eventId);

    const { data: rankings = [], isLoading: isLoadingRankings, isRefetching, refetch } = useRoundRankingsQuery(
        roundId,
        { trackId: selectedTrackId !== "all" ? selectedTrackId : undefined }
    );

    const calculateMutation = useCalculateRoundRankingMutation();
    const publishMutation = usePublishRoundResultsMutation();

    const handleCalculate = () => {
        if (!roundId) return;
        calculateMutation.mutate({
            roundId,
            params: { trackId: selectedTrackId !== "all" ? selectedTrackId : undefined }
        });
    };

    const handlePublishResults = async (payload: PublishResultsRequest) => {
        if (!roundId) return;
        await publishMutation.mutateAsync({ roundId, payload });
        setPublishDialogOpen(false);
        refetch();
    };

    if (isLoadingInfo) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    if (!roundInfo) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8">
                <Alert severity="error">Round information not found.</Alert>
            </div>
        );
    }

    const trackOptions = tracks.map((t: SelectOption) => ({ id: t.id, name: t.name }));
    const selectedTrackName = tracks.find((t: SelectOption) => t.id === selectedTrackId)?.name;
    const lastCalculatedTime = rankings.length > 0 ? rankings[0].calculatedAt : null;
    const gradingLocked = roundInfo.gradingLocked;
    const selectedAssignments = roundInfo.judgeAssignments.filter(
        (assignment) =>
            selectedTrackId === "all" || assignment.trackId === selectedTrackId,
    );
    const uniqueSubmissions = new Map(
        selectedAssignments
            .flatMap((assignment) => assignment.submissions)
            .map((submission) => [submission.submissionId, submission] as const),
    );
    const uniqueSubmissionCount = uniqueSubmissions.size;
    const completedSubmissionCount = [...uniqueSubmissions.values()].filter(
        (submission) => submission.completed,
    ).length;
    const judgeAssignmentCount =
        selectedTrackId === "all"
            ? roundInfo.totalAssignedSubmissions
            : selectedAssignments.reduce(
                (total, assignment) => total + assignment.totalAssignedSubmissions,
                0,
            );

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-10 border-b border-slate-200 pb-8 dark:border-slate-800">
                <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                    <div className="space-y-4">
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
                            Round results
                        </p>
                        <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-slate-900 dark:text-white md:text-5xl">
                            {roundInfo.roundName}
                        </h1>
                        <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                            Review the calculated order, inspect disqualifications, and prepare the official release.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Coordinator</span>
                            <span>/</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Rounds</span>
                            <span>/</span>
                            <span className="font-semibold text-slate-900 dark:text-white">Rankings</span>
                        </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-3">
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
                        variant="outlined"
                        color="inherit"
                        startIcon={<ArrowBackOutlinedIcon />}
                        onClick={() => navigate(`/coordinator/events/${roundInfo.eventId}/rankings`)}
                        sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                    >
                        Event Rankings
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        endIcon={<ArrowForwardOutlinedIcon />}
                        onClick={() => navigate(`/coordinator/rounds/${roundId}/advancement`)}
                        sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                    >
                        Go to Advancement
                    </Button>
                    <Link to={`/coordinator/events/${roundInfo.eventId}/disqualifications`} style={{ textDecoration: 'none' }}>
                        <Button
                            variant="outlined"
                            color="error"
                            sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                        >
                            View disqualifications
                        </Button>
                    </Link>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PublishOutlinedIcon />}
                        disabled={rankings.length === 0}
                        onClick={() => setPublishDialogOpen(true)}
                        sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                    >
                        Publish Results
                    </Button>
                    </div>
                </div>
                <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-5">
                    <div>
                        <dd className="font-mono text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{uniqueSubmissionCount}</dd>
                        <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Unique submissions</dt>
                    </div>
                    <div>
                        <dd className="font-mono text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{roundInfo.totalAssignedSubmissions}</dd>
                        <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Judge assignments</dt>
                    </div>
                    <div>
                        <dd className="font-mono text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{rankings.length}</dd>
                        <dt className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Rows in view</dt>
                    </div>
                </dl>
            </header>

            {showRecalculationBanner && (
                <Alert severity="warning" onClose={handleCloseBanner} sx={{ mb: 4, borderRadius: "12px", fontWeight: 600 }}>
                    Ranking was recalculated after disqualification. Please review advancement/prize decisions again.
                </Alert>
            )}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <RankingFilterBar
                    rounds={[{ id: roundId!, name: roundInfo.roundName }]}
                    tracks={trackOptions}
                    selectedRoundId={roundId!}
                    selectedTrackId={selectedTrackId}
                    onRoundChange={() => { }}
                    onTrackChange={setSelectedTrackId}
                    showTrackFilter={trackOptions.length > 0}
                />
            </div>

            <div className="mb-6">
                <CalculateRankingPanel
                    roundName={roundInfo.roundName}
                    trackName={selectedTrackName}
                    gradingLocked={gradingLocked}
                    lastCalculatedTime={lastCalculatedTime}
                    rankingRowCount={rankings.length}
                    uniqueSubmissionCount={uniqueSubmissionCount}
                    completedSubmissionCount={completedSubmissionCount}
                    judgeAssignmentCount={judgeAssignmentCount}
                    isCalculating={calculateMutation.isPending}
                    onCalculate={handleCalculate}
                    onOpenGradingProgress={() =>
                        navigate(`/coordinator/rounds/${roundId}/grading-progress`)
                    }
                />
            </div>

            <div className="mb-4 space-y-3">
                {!gradingLocked && (
                    <Alert severity="warning" sx={{ borderRadius: "12px", fontWeight: 600 }}>
                        Warning: Grading must be locked before ranking calculation.
                    </Alert>
                )}
                {gradingLocked && rankings.length === 0 && !isLoadingRankings && (
                    <Alert severity="warning" sx={{ borderRadius: "12px", fontWeight: 600 }}>
                        No ranking rows yet. Click Calculate Ranking to materialize results from the{" "}
                        {completedSubmissionCount} complete unique submission
                        {completedSubmissionCount === 1 ? "" : "s"}.
                    </Alert>
                )}
            </div>

            <section className="mb-8">
                {isLoadingRankings ? (
                    <div className="flex h-64 items-center justify-center">
                        <CircularProgress />
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <RankingPodium rankings={rankings} />
                        </div>
                        <div className="hidden md:block">
                            <RankingTable rankings={rankings} />
                        </div>
                        <div className="flex flex-col gap-4 md:hidden">
                            {rankings.map(ranking => (
                                <MobileRankingCard key={ranking.id} ranking={ranking} />
                            ))}
                            {rankings.length === 0 && (
                                <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-slate-500">
                                    No rankings available yet.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </section>
            <PublishResultsDialog
                open={publishDialogOpen}
                scopeLabel={roundInfo.roundName}
                rankingCount={rankings.length}
                defaultTitle={`Results are published for ${roundInfo.roundName}`}
                defaultContent="The round results are now available. Please open the leaderboard or your team score page for details."
                isPending={publishMutation.isPending}
                onClose={() => setPublishDialogOpen(false)}
                onConfirm={handlePublishResults}
            />
        </div>
    );
};
