import type { RankingResponse } from "@/types/ranking.types";
import type { TrackResponse } from "@/types/track.types";

export function getRankingTeamName(row?: RankingResponse) {
  return row?.teamName || "TBA";
}

export function getRankingScore(row?: RankingResponse) {
  return Number(row?.totalScore ?? 0);
}

export function getRankingPosition(row?: RankingResponse) {
  return Number(row?.rankPosition ?? 0);
}

export function sortRankings(rows: RankingResponse[]) {
  return [...rows].sort((a, b) => {
    const rankA = getRankingPosition(a);
    const rankB = getRankingPosition(b);

    if (rankA && rankB) return rankA - rankB;

    return getRankingScore(b) - getRankingScore(a);
  });
}

export function getRankingTrackName(
  trackId?: string | null,
  tracks: TrackResponse[] = [],
) {
  if (!trackId) return "General";
  return tracks.find((track) => track.id === trackId)?.name || "General";
}

export function getRankingTrackOptions(
  rankings: RankingResponse[],
  tracks: TrackResponse[] = [],
) {
  const trackIds = [
    ...new Set(rankings.map((ranking) => ranking.trackId).filter(Boolean)),
  ];

  return [
    { value: "All", label: "All Categories" },
    ...trackIds.map((trackId) => ({
      value: trackId,
      label: getRankingTrackName(trackId, tracks),
    })),
  ];
}

export function filterRankings(
  rows: RankingResponse[],
  search: string,
  trackId: string,
) {
  const normalized = search.trim().toLowerCase();

  return rows.filter((row) => {
    const matchesSearch =
      !normalized || getRankingTeamName(row).toLowerCase().includes(normalized);

    const matchesTrack = trackId === "All" || row.trackId === trackId;

    return matchesSearch && matchesTrack;
  });
}