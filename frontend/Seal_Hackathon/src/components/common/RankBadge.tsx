// Reused in: AllEventsStandings, SingleEventLeaderboard
import React from 'react';

const RANK_BADGE_STYLES: Record<number, string> = {
  1: 'bg-blue-500 text-white shadow-md',
  2: 'bg-gray-400 text-white',
  3: 'bg-amber-600 text-white',
};

interface RankBadgeProps {
  rank: number;
}

export const RankBadge = ({ rank }: RankBadgeProps) => (
  <span
    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-sm ${
      RANK_BADGE_STYLES[rank] ?? 'text-gray-400 bg-gray-50'}`}>
    {rank}
  </span>
);