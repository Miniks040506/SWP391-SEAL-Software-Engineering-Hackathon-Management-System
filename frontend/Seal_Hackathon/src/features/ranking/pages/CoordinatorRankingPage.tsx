import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, CircularProgress } from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import { useCoordinatorEventDetailQuery, useCoordinatorEventRoundsQuery, useCoordinatorEventTracksQuery } from "@/features/coordinator/hooks/useCoordinatorEventQueries";
import { useRoundRankingsQuery, useEventRankingsQuery } from "../hooks/useRankingQueries";
import { useCalculateRoundRankingMutation, usePublishEventResultsMutation } from "../hooks/useRankingMutations";
import { useRoundGradingProgressQuery } from "@/features/grading-progress/hooks/useGradingProgressQueries";
import type { PublishResultsRequest } from "@/types/ranking.types";

import { CalculateRankingPanel } from "../components/CalculateRankingPanel";
import { RankingFilterBar } from "../components/RankingFilterBar";
import { RankingPodium } from "../components/RankingPodium";
import { RankingTable } from "../components/RankingTable";
import { MobileRankingCard } from "../components/MobileRankingCard";
import { PublishResultsDialog } from "../components/PublishResultsDialog";
import { LeaderboardHeader } from "../components/LeaderboardHeader";

type SelectOption = { id: string; name: string };

export const CoordinatorRankingPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [selectedRoundId, setSelectedRoundId] = useState<string>("all");
    const [selectedTrackId, setSelectedTrackId] = useState<string>("all");
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);

    const { data: event } = useCoordinatorEventDetailQuery(eventId);
    const { data: rounds = [] } = useCoordinatorEventRoundsQuery(eventId);
    const { data: tracks = [] } = useCoordinatorEventTracksQuery(eventId);

    const activeRoundId = selectedRoundId === "all" && rounds.length > 0
        ? rounds[0].id
        : selectedRoundId;

    const { data: roundProgress } = useRoundGradingProgressQuery(
        activeRoundId !== "all" ? activeRoundId : undefined
    );
    const gradingLocked = roundProgress?.gradingLocked ?? false;

    const rankingParams = {
        trackId: selectedTrackId !== "all" ? selectedTrackId : undefined,
    };
    const eventRankingsQuery = useEventRankingsQuery(
        activeRoundId === "all" ? eventId : undefined,
        rankingParams,
    );
    const roundRankingsQuery = useRoundRankingsQuery(
        activeRoundId !== "all" ? activeRoundId : undefined,
        rankingParams,
    );
    const { data: rankings = [], isLoading, isRefetching, refetch } =
        activeRoundId === "all" ? eventRankingsQuery : roundRankingsQuery;

    const calculateMutation = useCalculateRoundRankingMutation();
    const publishMutation = usePublishEventResultsMutation();

    const handleCalculate = () => {
        if (activeRoundId === "all") return;
        calculateMutation.mutate({
            roundId: activeRoundId,
            params: { trackId: selectedTrackId !== "all" ? selectedTrackId : undefined }
        });
    };

    const handlePublishResults = async (payload: PublishResultsRequest) => {
        if (!eventId) return;
        await publishMutation.mutateAsync({ eventId, payload });
        setPublishDialogOpen(false);
        refetch();
    };

    if (!event) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    const roundOptions = rounds.map((r: SelectOption) => ({ id: r.id, name: r.name }));
    const trackOptions = tracks.map((t: SelectOption) => ({ id: t.id, name: t.name }));

    const selectedRoundName = rounds.find((r: SelectOption) => r.id === activeRoundId)?.name;
    const selectedTrackName = tracks.find((t: SelectOption) => t.id === selectedTrackId)?.name;

    const lastCalculatedTime = rankings.length > 0 ? rankings[0].calculatedAt : null;
    const selectedAssignments = (roundProgress?.judgeAssignments ?? []).filter(
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
            ? roundProgress?.totalAssignedSubmissions
            : selectedAssignments.reduce(
                (total, assignment) => total + assignment.totalAssignedSubmissions,
                0,
            );
    const teamCount = new Set(rankings.map((ranking) => ranking.teamId)).size;
    const publishedDate =
        event.resultPublishedAt ??
        (rankings.some((ranking) => ranking.published)
            ? rankings[0]?.calculatedAt
            : null);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <nav className="mb-8">
                <button
                    type="button"
                    onClick={() => navigate("/coordinator/events")}
                    className="group inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                    <ArrowBackRoundedIcon
                        sx={{ fontSize: 17 }}
                        className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-0.5 motion-reduce:group-hover:translate-x-0"
                    />
                    All events
                </button>
            </nav>

            <LeaderboardHeader
                event={event}
                publishedDate={publishedDate}
                roundCount={rounds.length}
                trackCount={tracks.length}
                teamCount={teamCount}
            />

            <section
                aria-label="Result publishing actions"
                className="mb-10 flex flex-wrap items-center justify-end gap-3 border-b border-slate-200 py-5 dark:border-slate-800"
            >
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
                    color="primary"
                    endIcon={<ArrowForwardOutlinedIcon />}
                    onClick={() => navigate(`/coordinator/rounds/${activeRoundId}/advancement`)}
                    disabled={activeRoundId === "all"}
                    sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                >
                    Advancement
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PublishOutlinedIcon />}
                    disabled={rankings.length === 0 || publishMutation.isPending}
                    onClick={() => setPublishDialogOpen(true)}
                    sx={{ borderRadius: "10px", fontWeight: 800, textTransform: "none" }}
                >
                    Publish results
                </Button>
            </section>

            {!isLoading && rankings.length > 0 && (
                <div className="mb-8">
                    <RankingPodium rankings={rankings} />
                </div>
            )}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <RankingFilterBar
                    rounds={roundOptions}
                    tracks={trackOptions}
                    selectedRoundId={activeRoundId}
                    selectedTrackId={selectedTrackId}
                    onRoundChange={setSelectedRoundId}
                    onTrackChange={setSelectedTrackId}
                />
            </div>

            {activeRoundId !== "all" && (
                <div className="mb-6">
                    <CalculateRankingPanel
                        roundName={selectedRoundName}
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
                            navigate(`/coordinator/rounds/${activeRoundId}/grading-progress`)
                        }
                    />
                </div>
            )}

            <div className="mb-4 space-y-3">
                {!gradingLocked && activeRoundId !== "all" && (
                    <Alert severity="warning" sx={{ borderRadius: "12px", fontWeight: 600 }}>
                        Warning: Grading must be locked before ranking calculation.
                    </Alert>
                )}
                {gradingLocked && rankings.length === 0 && !isLoading && activeRoundId !== "all" && (
                    <Alert severity="warning" sx={{ borderRadius: "12px", fontWeight: 600 }}>
                        No ranking rows yet. Click Calculate Ranking to materialize results from the{" "}
                        {completedSubmissionCount} complete unique submission
                        {completedSubmissionCount === 1 ? "" : "s"}.
                    </Alert>
                )}
            </div>

            <section className="mb-8">
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <CircularProgress />
                    </div>
                ) : (
                    <>
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
                scopeLabel={event.name}
                rankingCount={rankings.length}
                defaultTitle={`Results are published for ${event.name}`}
                defaultContent="The results are now available. Please open the leaderboard or your team score page for details."
                isPending={publishMutation.isPending}
                onClose={() => setPublishDialogOpen(false)}
                onConfirm={handlePublishResults}
            />
        </div>
    );
};
