import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Alert, Button, CircularProgress } from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

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

type SelectOption = { id: string; name: string };

export const CoordinatorRankingPage = () => {
    const { eventId } = useParams();

    const [selectedRoundId, setSelectedRoundId] = useState<string>("all");
    const [selectedTrackId, setSelectedTrackId] = useState<string>("all");
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);
    const [showRecalculationBanner, setShowRecalculationBanner] = useState(
        () => sessionStorage.getItem("rankingRecalculated") === "true"
    );

    const handleCloseBanner = () => {
        setShowRecalculationBanner(false);
        sessionStorage.removeItem("rankingRecalculated");
    };

    const { data: event } = useCoordinatorEventDetailQuery(eventId);
    const { data: rounds = [] } = useCoordinatorEventRoundsQuery(eventId);
    const { data: tracks = [] } = useCoordinatorEventTracksQuery(eventId);

    useEffect(() => {
        if (rounds.length > 0 && selectedRoundId === "all") {
            setSelectedRoundId(rounds[0].id);
        }
    }, [rounds, selectedRoundId]);

    const { data: roundProgress } = useRoundGradingProgressQuery(
        selectedRoundId !== "all" ? selectedRoundId : undefined
    );
    const gradingLocked = roundProgress?.gradingLocked ?? false;

    const { data: rankings = [], isLoading, isRefetching, refetch } = selectedRoundId === "all"
        ? useEventRankingsQuery(eventId, { trackId: selectedTrackId !== "all" ? selectedTrackId : undefined })
        : useRoundRankingsQuery(selectedRoundId, { trackId: selectedTrackId !== "all" ? selectedTrackId : undefined });

    const calculateMutation = useCalculateRoundRankingMutation();
    const publishMutation = usePublishEventResultsMutation();

    const handleCalculate = () => {
        if (selectedRoundId === "all") return;
        calculateMutation.mutate({
            roundId: selectedRoundId,
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

    const selectedRoundName = rounds.find((r: SelectOption) => r.id === selectedRoundId)?.name;
    const selectedTrackName = tracks.find((t: SelectOption) => t.id === selectedTrackId)?.name;

    const lastCalculatedTime = rankings.length > 0 ? rankings[0].calculatedAt : null;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        Rankings
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Calculate and preview rankings after grading is locked.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Coordinator</span>
                        <span>/</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Events</span>
                        <span>/</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{event.name}</span>
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
                        color="primary"
                        endIcon={<ArrowForwardOutlinedIcon />}
                        sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                    >
                        Go to Advancement
                    </Button>
                    <Link to={`/coordinator/events/${eventId}/disqualifications`} style={{ textDecoration: 'none' }}>
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
            </header>

            {showRecalculationBanner && (
                <Alert severity="warning" onClose={handleCloseBanner} sx={{ mb: 4, borderRadius: "12px", fontWeight: 600 }}>
                    Ranking was recalculated after disqualification. Please review advancement/prize decisions again.
                </Alert>
            )}

            {!isLoading && rankings.length > 0 && (
                <div className="mb-8">
                    <RankingPodium rankings={rankings} />
                </div>
            )}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <RankingFilterBar
                    rounds={roundOptions}
                    tracks={trackOptions}
                    selectedRoundId={selectedRoundId}
                    selectedTrackId={selectedTrackId}
                    onRoundChange={setSelectedRoundId}
                    onTrackChange={setSelectedTrackId}
                />
            </div>

            {selectedRoundId !== "all" && (
                <div className="mb-6">
                    <CalculateRankingPanel
                        roundName={selectedRoundName}
                        trackName={selectedTrackName}
                        gradingLocked={gradingLocked}
                        lastCalculatedTime={lastCalculatedTime}
                        rankingRowCount={rankings.length}
                        isCalculating={calculateMutation.isPending}
                        onCalculate={handleCalculate}
                    />
                </div>
            )}

            <div className="mb-4 space-y-3">
                {!gradingLocked && selectedRoundId !== "all" && (
                    <Alert severity="warning" sx={{ borderRadius: "12px", fontWeight: 600 }}>
                        Warning: Grading must be locked before ranking calculation.
                    </Alert>
                )}
                {gradingLocked && rankings.length === 0 && !isLoading && selectedRoundId !== "all" && (
                    <Alert severity="warning" sx={{ borderRadius: "12px", fontWeight: 600 }}>
                        Warning: No submitted final scores found for this round or ranking not calculated yet.
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
