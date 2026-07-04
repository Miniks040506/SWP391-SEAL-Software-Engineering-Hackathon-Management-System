import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CircularProgress, Button } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import {
    usePublicEventDetailQuery,
    usePublicEventRoundsQuery,
    usePublicEventTracksQuery,
    usePublicEventAwardsQuery,
} from "../../events/hooks/usePublicEventQueries";
import { usePublicEventLeaderboardQuery, usePublicTrackLeaderboardQuery } from "../hooks/useRankingQueries";
import { useMemo } from "react";
import type { PrizeResponse } from "@/types/prize.types";

import { LeaderboardHeader } from "../components/LeaderboardHeader";
import { LeaderboardEmptyState } from "../components/LeaderboardEmptyState";
import { RankingTable } from "../components/RankingTable";
import { RankingPodium } from "../components/RankingPodium";
import { RankingFilterBar } from "../components/RankingFilterBar";
import { MobileRankingCard } from "../components/MobileRankingCard";

export const PublicEventLeaderboardPage = () => {
    const { eventId, trackId } = useParams<{ eventId: string; trackId?: string }>();
    const navigate = useNavigate();

    const [selectedRoundId, setSelectedRoundId] = useState<string>("all");
    const [selectedTrackId, setSelectedTrackId] = useState<string>(trackId || "all");

    useEffect(() => {
        if (selectedTrackId === "all" && trackId) {
            navigate(`/events/${eventId}/leaderboard`, { replace: true });
        } else if (selectedTrackId !== "all" && selectedTrackId !== trackId) {
            navigate(`/events/${eventId}/tracks/${selectedTrackId}/leaderboard`, { replace: true });
        }
    }, [selectedTrackId, eventId, trackId, navigate]);

    const { data: event, isLoading: isLoadingEvent } = usePublicEventDetailQuery(eventId);

    const { data: rounds = [] } = usePublicEventRoundsQuery(eventId);
    const { data: tracks = [] } = usePublicEventTracksQuery(eventId);

    const { data: rankings = [], isLoading: isLoadingRankings } = selectedTrackId === "all"
        ? usePublicEventLeaderboardQuery(eventId, { roundId: selectedRoundId !== "all" ? selectedRoundId : undefined })
        : usePublicTrackLeaderboardQuery(eventId, selectedTrackId, { roundId: selectedRoundId !== "all" ? selectedRoundId : undefined });

    const { data: awards = [] } = usePublicEventAwardsQuery(eventId);
    const awardsByTeamId = useMemo(() => {
        const map = new Map<string, PrizeResponse[]>();
        for (const award of awards) {
            if (award.awardedTeamId) {
                const teamAwards = map.get(award.awardedTeamId) || [];
                teamAwards.push(award);
                map.set(award.awardedTeamId, teamAwards);
            }
        }
        return map;
    }, [awards]);

    if (isLoadingEvent) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">Event Not Found</h2>
                <Button component={Link} to="/standings" variant="outlined" startIcon={<ArrowBackOutlinedIcon />} sx={{ mt: 2, borderRadius: "10px", textTransform: "none", fontWeight: 700 }}>
                    Back to Standings
                </Button>
            </div>
        );
    }

    const roundOptions = rounds.map(r => ({ id: r.id, name: r.name }));
    const trackOptions = tracks.map(t => ({ id: t.id, name: t.name }));

    const isPublished = rankings.length > 0;
    const publishedDate = isPublished ? rankings[0].calculatedAt : null;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6 flex">
                <Button
                    component={Link}
                    to="/standings"
                    color="inherit"
                    startIcon={<ArrowBackOutlinedIcon />}
                    sx={{ textTransform: "none", fontWeight: 600, color: "text.secondary" }}
                >
                    All Standings
                </Button>
            </div>

            <div className="mb-8">
                <LeaderboardHeader
                    eventName={event.name}
                    title="Official Leaderboard"
                    publishedDate={publishedDate}
                />
            </div>

            {!isLoadingRankings && isPublished && (
                <RankingPodium rankings={rankings} />
            )}

            <div className="mb-6 flex shrink-0 items-center">
                <RankingFilterBar
                    rounds={roundOptions}
                    tracks={trackOptions}
                    selectedRoundId={selectedRoundId}
                    selectedTrackId={selectedTrackId}
                    onRoundChange={setSelectedRoundId}
                    onTrackChange={setSelectedTrackId}
                />
            </div>

            <section>
                {isLoadingRankings ? (
                    <div className="flex h-64 items-center justify-center">
                        <CircularProgress />
                    </div>
                ) : !isPublished ? (
                    <LeaderboardEmptyState />
                ) : (
                    <>
                        <div className="hidden md:block">
                            <RankingTable rankings={rankings} awardsByTeamId={awardsByTeamId} />
                        </div>
                        <div className="flex flex-col gap-4 md:hidden">
                            {rankings.map(ranking => (
                                <MobileRankingCard key={ranking.id} ranking={ranking} awardsByTeamId={awardsByTeamId} />
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};
