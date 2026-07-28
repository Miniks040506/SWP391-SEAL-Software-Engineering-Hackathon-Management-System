import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, CircularProgress } from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import { useCoordinatorEventDetailQuery, useCoordinatorEventRoundsQuery, useCoordinatorEventTracksQuery } from "@/features/coordinator/hooks/useCoordinatorEventQueries";
import { useRoundRankingsQuery } from "../hooks/useRankingQueries";
import {
    useApproveRankingTieMutation,
    useCalculateRoundRankingMutation,
    usePublishRoundResultsMutation,
} from "../hooks/useRankingMutations";
import { useRoundGradingProgressQuery } from "@/features/grading-progress/hooks/useGradingProgressQueries";
import { useCoordinatorPublishedAwardsQuery } from "@/features/coordinator/hooks/useCoordinatorPrizeQueries";
import type { PrizeResponse } from "@/types/prize.types";
import type { PublishResultsRequest, RankingResponse } from "@/types/ranking.types";
import type { RoundResponse } from "@/types/round.types";

import { CalculateRankingPanel } from "../components/CalculateRankingPanel";
import { CoordinatorRankingTable } from "../components/CoordinatorRankingTable";
import { CoordinatorResultsPodium } from "../components/CoordinatorResultsPodium";
import { PublishResultsDialog } from "../components/PublishResultsDialog";
import { LeaderboardHeader } from "../components/LeaderboardHeader";
import { RoundSelectorRail } from "../components/RoundSelectorRail";
import { TrackPillFilter } from "../components/TrackPillFilter";
import "./rankings.css";

type SelectOption = { id: string; name: string };

const LOCKED_ROUND_STATUSES = new Set(["CLOSED", "JUDGING", "RESULTS_READY"]);

function pickDefaultRound(rounds: RoundResponse[]): string | undefined {
    if (rounds.length === 0) return undefined;
    const ascending = [...rounds].sort((a, b) => a.orderIndex - b.orderIndex);
    const descending = [...ascending].reverse();
    const completed = descending.find(
        (round) => round.status === "RESULTS_READY" || round.resultPublishedAt,
    );
    if (completed) return completed.id;

    const locked = descending.find((round) =>
        LOCKED_ROUND_STATUSES.has(round.status),
    );
    if (locked) return locked.id;

    return ascending.at(-1)?.id;
}

export const CoordinatorRankingPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [selectedRoundId, setSelectedRoundId] = useState<string>();
    const [selectedTrackId, setSelectedTrackId] = useState<string>("all");
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);

    const { data: event } = useCoordinatorEventDetailQuery(eventId);
    const { data: rounds = [], isSuccess: roundsLoaded } =
        useCoordinatorEventRoundsQuery(eventId);
    const { data: tracks = [] } = useCoordinatorEventTracksQuery(eventId);
    const { data: awards = [] } = useCoordinatorPublishedAwardsQuery(eventId);

    useEffect(() => {
        if (!selectedRoundId && roundsLoaded) {
            const defaultRoundId = pickDefaultRound(rounds);
            if (!defaultRoundId) return;
            queueMicrotask(() => {
                setSelectedRoundId((currentRoundId) =>
                    currentRoundId ?? defaultRoundId,
                );
            });
        }
    }, [rounds, roundsLoaded, selectedRoundId]);

    const activeRoundId = selectedRoundId;
    const activeRound = rounds.find((round) => round.id === activeRoundId);
    const roundFinalized = Boolean(activeRound?.resultPublishedAt);

    const { data: roundProgress } = useRoundGradingProgressQuery(activeRoundId);
    const gradingLocked = roundProgress?.gradingLocked ?? false;

    const rankingParams = {
        trackId: selectedTrackId !== "all" ? selectedTrackId : undefined,
    };
    // Table respects the track filter; the podium always reflects all tracks.
    const roundRankingsQuery = useRoundRankingsQuery(activeRoundId, rankingParams);
    const podiumRankingsQuery = useRoundRankingsQuery(activeRoundId, {});
    const { data: rankings = [], isLoading, isRefetching } = roundRankingsQuery;
    const podiumRankings = podiumRankingsQuery.data ?? [];

    const calculateMutation = useCalculateRoundRankingMutation();
    const approveTieMutation = useApproveRankingTieMutation();
    const roundPublishMutation = usePublishRoundResultsMutation();
    const isPublishing = roundPublishMutation.isPending;

    const refetchRankings = () => {
        roundRankingsQuery.refetch();
        podiumRankingsQuery.refetch();
    };

    const handleCalculate = () => {
        if (!activeRoundId) return;
        // Always calculate across every track, regardless of the active filter.
        calculateMutation.mutate({ roundId: activeRoundId, params: {} });
    };

    const handlePublishResults = async (payload: PublishResultsRequest) => {
        if (!activeRoundId) return;
        await roundPublishMutation.mutateAsync({
            roundId: activeRoundId,
            payload,
        });
        setPublishDialogOpen(false);
        refetchRankings();
    };

    const handleApproveTie = (ranking: RankingResponse) => {
        if (!activeRoundId) return;
        if (!window.confirm(
            `Approve the tied score shared by ${ranking.tieGroupSize ?? 2} teams? The tied rank will be preserved.`,
        )) return;
        approveTieMutation.mutate({
            roundId: activeRoundId,
            rankingId: ranking.id,
        });
    };

    const awardsByTeamId = useMemo(() => {
        const map = new Map<string, PrizeResponse[]>();
        for (const award of awards) {
            if (!award.awardedTeamId) continue;
            const teamAwards = map.get(award.awardedTeamId) ?? [];
            teamAwards.push(award);
            map.set(award.awardedTeamId, teamAwards);
        }
        return map;
    }, [awards]);

    if (!event) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    const trackOptions = tracks.map((t: SelectOption) => ({ id: t.id, name: t.name }));
    const selectedRoundName = rounds.find((r: SelectOption) => r.id === activeRoundId)?.name;

    const lastCalculatedTime = rankings.length > 0 ? rankings[0].calculatedAt : null;
    const roundAssignments = roundProgress?.judgeAssignments ?? [];
    const uniqueSubmissions = new Map(
        roundAssignments
            .flatMap((assignment) => assignment.submissions)
            .map((submission) => [submission.submissionId, submission] as const),
    );
    const uniqueSubmissionCount = uniqueSubmissions.size;
    const completedSubmissionCount = [...uniqueSubmissions.values()].filter(
        (submission) => submission.completed,
    ).length;
    const judgeAssignmentCount = roundProgress?.totalAssignedSubmissions;
    const teamCount = new Set(podiumRankings.map((ranking) => ranking.teamId)).size;
    const manualReviewCount = podiumRankings.filter(
        (ranking) => ranking.manualResolutionRequired,
    ).length;
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
                    onClick={refetchRankings}
                    disabled={!activeRoundId || isRefetching}
                    sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                >
                    Refresh
                </Button>
                <Button
                    variant="outlined"
                    color="primary"
                    endIcon={<ArrowForwardOutlinedIcon />}
                    onClick={() => navigate(`/coordinator/rounds/${activeRoundId}/advancement`)}
                    disabled={!activeRoundId || roundFinalized}
                    sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                >
                    {roundFinalized ? "Advancement Complete" : "Advancement"}
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PublishOutlinedIcon />}
                    disabled={
                        !activeRoundId ||
                        rankings.length === 0 ||
                        manualReviewCount > 0 ||
                        roundFinalized ||
                        isPublishing
                    }
                    onClick={() => setPublishDialogOpen(true)}
                    sx={{ borderRadius: "10px", fontWeight: 800, textTransform: "none" }}
                >
                    {roundFinalized ? "Results Published" : "Publish round"}
                </Button>
            </section>

            <section aria-label="Top standings" className="mb-10">
                {activeRoundId ? (
                    <div key={activeRoundId} className="rankboard-enter">
                        <CoordinatorResultsPodium
                            rankings={podiumRankings}
                            revealed={podiumRankings.length > 0}
                        />
                    </div>
                ) : (
                    <div className="h-56 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70 motion-reduce:animate-none" />
                )}
            </section>

            <div className="mb-8 space-y-4">
                {activeRoundId ? (
                    <>
                        <RoundSelectorRail
                            rounds={rounds}
                            selectedRoundId={activeRoundId}
                            onSelect={setSelectedRoundId}
                            includeAllSegment={false}
                        />
                        <TrackPillFilter
                            tracks={trackOptions}
                            selectedTrackId={selectedTrackId}
                            onSelect={setSelectedTrackId}
                        />
                    </>
                ) : (
                    <div className="space-y-3" aria-label="Loading result filters">
                        <div className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/70 motion-reduce:animate-none" />
                        <div className="h-11 w-72 max-w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-800/70 motion-reduce:animate-none" />
                    </div>
                )}
            </div>

            {activeRoundId && (
                <div className="mb-6">
                    <CalculateRankingPanel
                        roundName={selectedRoundName}
                        gradingLocked={gradingLocked}
                        finalized={roundFinalized}
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
                {activeRoundId && !gradingLocked && (
                    <Alert severity="warning" sx={{ borderRadius: "12px", fontWeight: 600 }}>
                        Warning: Grading must be locked before ranking calculation.
                    </Alert>
                )}
                {activeRoundId &&
                    gradingLocked &&
                    rankings.length === 0 &&
                    !isLoading && (
                    <Alert severity="warning" sx={{ borderRadius: "12px", fontWeight: 600 }}>
                        No ranking rows yet. Click Calculate Ranking to materialize results from the{" "}
                        {completedSubmissionCount} complete unique submission
                        {completedSubmissionCount === 1 ? "" : "s"}.
                    </Alert>
                )}
                {manualReviewCount > 0 && (
                    <Alert severity="warning" sx={{ borderRadius: "12px", fontWeight: 600 }}>
                        Review and approve each tied group before publishing results.
                    </Alert>
                )}
            </div>

            <section className="mb-8">
                <div
                    key={activeRoundId ?? "loading"}
                    className={activeRoundId ? "rankboard-enter" : undefined}
                >
                    {!activeRoundId || isLoading ? (
                        <div className="space-y-4" aria-label="Loading rankings">
                            {[1, 2, 3, 4].map((row) => (
                                <div
                                    key={row}
                                    className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/70 motion-reduce:animate-none"
                                />
                            ))}
                        </div>
                    ) : (
                        <CoordinatorRankingTable
                            rankings={rankings}
                            awardsByTeamId={awardsByTeamId}
                            approvingRankingId={
                                approveTieMutation.isPending
                                    ? approveTieMutation.variables?.rankingId
                                    : undefined
                            }
                            onApproveTie={handleApproveTie}
                        />
                    )}
                </div>
            </section>
            <PublishResultsDialog
                open={publishDialogOpen}
                scopeLabel={selectedRoundName ?? event.name}
                rankingCount={rankings.length}
                defaultTitle={`${selectedRoundName ?? "Round"} results are published`}
                defaultContent="This round's results are now available to participants on their team score pages."
                isPending={isPublishing}
                onClose={() => setPublishDialogOpen(false)}
                onConfirm={handlePublishResults}
            />
        </div>
    );
};
