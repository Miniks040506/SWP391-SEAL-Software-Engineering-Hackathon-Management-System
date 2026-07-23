import type { RankingResponse } from "@/types/ranking.types";

import type { PrizeResponse } from "@/types/prize.types";
import { WinnerPrizeBadge } from "@/features/events/components/WinnerPrizeBadge";
import { RankingStatusBadge } from "./RankingStatusBadge";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

interface MobileRankingCardProps {
  ranking: RankingResponse;
  awardsByTeamId?: Map<string, PrizeResponse[]>;
}

export const MobileRankingCard = ({ ranking, awardsByTeamId }: MobileRankingCardProps) => {
  const disqualified =
    ranking.advanceReason === "DISQUALIFIED" ||
    ranking.submissionStatus === "DISQUALIFIED";

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
          {awardsByTeamId?.get(ranking.teamId)?.map(prize => (
            <WinnerPrizeBadge key={prize.id} prizeTitle={prize.title || ""} className="h-6 w-6" />
          ))}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="font-black text-blue-600 dark:text-blue-400">
            {Number(ranking.totalScore).toFixed(2)} pts
          </div>
          {ranking.tied && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              <ReportProblemOutlinedIcon sx={{ fontSize: 14 }} />
              Tie{ranking.tieGroupSize ? ` x${ranking.tieGroupSize}` : ""}
            </span>
          )}
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

      {disqualified ? (
        <div className="mt-2">
          <RankingStatusBadge type="DISQUALIFIED" />
        </div>
      ) : ranking.finalRound ? (
        <div className="mt-2">
          <RankingStatusBadge type="FINAL_RESULT" />
        </div>
      ) : ranking.advanced && (
        <div className="mt-2 text-xs font-bold text-emerald-600">
          ✓ Advanced to next round
        </div>
      )}
    </div>
  );
};
