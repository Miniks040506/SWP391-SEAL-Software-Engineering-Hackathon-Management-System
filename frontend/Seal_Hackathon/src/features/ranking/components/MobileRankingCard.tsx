import type { RankingResponse } from "@/types/ranking.types";

interface MobileRankingCardProps {
  ranking: RankingResponse;
}

export const MobileRankingCard = ({ ranking }: MobileRankingCardProps) => {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            #{ranking.rankPosition}
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {ranking.teamName}
          </span>
        </div>
        <div className="font-black text-blue-600 dark:text-blue-400">
          {Number(ranking.totalScore).toFixed(2)} pts
        </div>
      </div>

      <div className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-400">
        {ranking.projectTitle && (
          <div className="line-clamp-1 italic">"{ranking.projectTitle}"</div>
        )}
        <div className="flex justify-between">
          <span>Track:</span>
          <span className="font-medium text-slate-900 dark:text-slate-300">
            {ranking.trackName || "-"}
          </span>
        </div>
      </div>

      {ranking.advanced && (
        <div className="mt-2 text-xs font-bold text-emerald-600">
          ✓ Advanced to next round
        </div>
      )}
    </div>
  );
};
