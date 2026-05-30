import {
  getRankingPosition,
  getRankingScore,
  getRankingTeamName,
} from "@/features/ranking/utils/rankingView";
import type { RankingResponse } from "@/types/ranking.types";

type StandingsTableProps = {
  rankings: RankingResponse[];
  variant?: "compact" | "full";
  emptyMessage?: string;
};

export function StandingsTable({
  rankings,
  variant = "full",
  emptyMessage = "No results found.",
}: StandingsTableProps) {
  if (rankings.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-sm font-bold uppercase tracking-widest text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  const visibleRows = variant === "compact" ? rankings.slice(0, 5) : rankings;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs font-black uppercase tracking-widest text-gray-400">
          <tr>
            <th className="px-5 py-4">Rank</th>
            <th className="px-5 py-4">Team</th>
            <th className="px-5 py-4">Score</th>
            <th className="hidden px-5 py-4 md:table-cell">Advanced</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {visibleRows.map((row) => (
            <tr key={row.id} className="hover:bg-blue-50/30">
              <td className="px-5 py-4 font-black text-blue-500">
                #{getRankingPosition(row)}
              </td>

              <td className="px-5 py-4 font-bold text-gray-900">
                {getRankingTeamName(row)}
              </td>

              <td className="px-5 py-4 font-mono font-black text-gray-700">
                {getRankingScore(row).toFixed(1)}
              </td>

              <td className="hidden px-5 py-4 md:table-cell">
                {row.advanced ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase text-emerald-600">
                    Advanced
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-black uppercase text-gray-400">
                    —
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}