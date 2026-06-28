import type { UUID } from "@/types/common.types";
import type { RankingCalculationParams, LeaderboardParams, RoundRankingParams } from "@/types/ranking.types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const TEAMS = [
    "Alpha Geeks", "Byte Me", "Cyber Knights", "Data Miners",
    "Eco Builders", "Fintech Bros", "Grid Runners", "Hackers XYZ",
    "Innovators", "Java Junkies"
];

const TRACKS = ["AI Track", "Web3 Track", "Data Track", "Open Track"];

import { editEventMock } from "@/features/coordinator/mocks/coordinatorEditEvent.mock";

const generateRankings = (eventId: string, roundId?: string, trackId?: string, count: number = 8) => {
    const allRounds = editEventMock.tracks.flatMap(t => t.rounds);

    return Array.from({ length: count }).map((_, i) => {
        let assignedTrackId = trackId;
        let assignedTrackName = "";

        if (trackId && trackId !== "all") {
            const track = editEventMock.tracks.find(t => t.id === trackId);
            assignedTrackName = track?.name || `Track ${trackId}`;
        } else {
            const track = editEventMock.tracks[i % editEventMock.tracks.length];
            assignedTrackId = track.id;
            assignedTrackName = track.name;
        }

        let assignedRoundId = roundId;
        let assignedRoundName = "";

        if (roundId && roundId !== "all") {
            const round = allRounds.find(r => r.id === roundId);
            assignedRoundName = round?.name || `Round ${roundId}`;
        } else {
            assignedRoundId = "overall";
            const currentTrack = editEventMock.tracks.find(t => t.id === assignedTrackId);
            if (currentTrack && currentTrack.rounds && currentTrack.rounds.length > 0) {
                assignedRoundName = currentTrack.rounds[currentTrack.rounds.length - 1].name;
            } else {
                assignedRoundName = "Final Round";
            }
        }

        return {
            id: `rank-${assignedRoundId}-${assignedTrackId}-${i}`,
            eventId: eventId,
            submissionId: `sub-${i}`,
            roundId: assignedRoundId,
            roundName: assignedRoundName,
            rankPosition: i + 1,
            teamId: `team-${i}`,
            teamName: TEAMS[i % TEAMS.length] + (i >= TEAMS.length ? ` ${i}` : ""),
            trackId: assignedTrackId,
            trackName: assignedTrackName,
            projectTitle: `${TEAMS[i % TEAMS.length]} Project`,
            totalScore: Number((99.0 - (i * 1.5)).toFixed(2)),
            advanced: i < 3,
            judgeCount: Math.floor(Math.random() * 3) + 2,
            published: true,
            calculatedAt: new Date().toISOString()
        };
    });
};

export const mockRankingService = {
    getRankings: async (params?: { eventId?: UUID; roundId?: UUID; trackId?: UUID }) => {
        await delay(500);
        return generateRankings(params?.eventId || "mock-event", params?.roundId, params?.trackId, 10);
    },

    calculateRoundRankings: async (roundId: UUID, params?: RankingCalculationParams) => {
        await delay(800);
        return { success: true, roundId, message: "Rankings calculated successfully" };
    },

    getRoundRankings: async (roundId: UUID, params?: RoundRankingParams) => {
        await delay(500);
        return generateRankings("mock-event", roundId, params?.trackId, 8);
    },

    getEventRankings: async (eventId: UUID, params?: LeaderboardParams) => {
        await delay(500);
        return generateRankings(eventId, params?.roundId, params?.trackId, 10);
    },

    getPublicEventLeaderboard: async (eventId: UUID, params?: LeaderboardParams) => {
        await delay(500);
        return generateRankings(eventId, params?.roundId, params?.trackId, 10);
    },

    getPublicTrackLeaderboard: async (eventId: UUID, trackId: UUID, params?: Omit<LeaderboardParams, "trackId">) => {
        await delay(500);
        return generateRankings(eventId, params?.roundId, trackId, 5);
    }
};