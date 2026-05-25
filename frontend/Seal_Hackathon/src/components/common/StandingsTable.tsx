// Reused in: AllEventsStandings (compact variant), SingleEventLeaderboard (full variant)
import React from 'react';
import { RankBadge } from './RankBadge';
import type { RankingEntry } from '@/types/ranking.types';

interface StandingsTableProps {
  rankings: RankingEntry[];
  /* "compact" hides the Track column on small screens (used in AllEventsStandings mini-table).
     "full" always shows all columns (used in SingleEventLeaderboard). */
  variant?: 'compact' | 'full';
  emptyMessage?: string;
}

export const StandingsTable = ({
  rankings,
  variant = 'full',
  emptyMessage = 'No results found',
}: StandingsTableProps) => {
  const cellPadding = variant === 'full' ? 'p-5' : 'p-4';
  const trackCellClass =
    variant === 'compact' ? 'hidden sm:table-cell' : '';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className={`${cellPadding} text-xs font-bold text-gray-400 uppercase tracking-widest w-16 text-center`}>
              {variant === 'full' ? 'Rank' : '#'}
            </th>
            <th className={`${cellPadding} text-xs font-bold text-gray-400 uppercase tracking-widest`}>
              Team / Members
            </th>
            <th className={`${cellPadding} text-xs font-bold text-gray-400 uppercase tracking-widest ${trackCellClass}`}>
              Track
            </th>
            <th className={`${cellPadding} text-xs font-bold text-gray-400 uppercase tracking-widest text-right`}>
              {variant === 'full' ? 'Raw Score' : 'Score'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rankings.length > 0 ? (
            rankings.map((team) => (
              <tr
                key={team.rank}
                className={`hover:bg-gray-50 transition-colors ${
                  team.rank <= 3 ? 'bg-blue-50/10' : ''}`}>
                <td className={`${cellPadding} text-center`}>
                  <RankBadge rank={team.rank} />
                </td>
                <td className={cellPadding}>
                  <div className="text-sm font-bold text-gray-900 tracking-tight">
                    {team.team}
                  </div>
                  <div className="text-xs text-gray-400 font-semibold italic mt-0.5">
                    {team.members}
                  </div>
                </td>
                <td className={`${cellPadding} ${trackCellClass}`}>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 py-1 bg-gray-100 rounded">
                    {team.track}
                  </span>
                </td>
                <td className={`${cellPadding} text-right`}>
                  <span className="text-base font-mono font-bold text-gray-900 tracking-tight tabular-nums">
                    {team.score.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={4}
                className="p-24 text-center text-sm text-gray-400 font-bold uppercase tracking-widest">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};