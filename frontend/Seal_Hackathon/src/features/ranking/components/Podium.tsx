import { podiumStyles } from "@/features/ranking/pages/LeaderboardPage.styles";
import {
  getRankingScore,
  getRankingTeamName,
} from "@/features/ranking/utils/rankingView";
import type { RankingResponse } from "@/types/ranking.types";

type PodiumProps = {
  top3: RankingResponse[];
};

export function Podium({ top3 }: PodiumProps) {
  if (top3.length === 0) return null;

  return (
    <section className={podiumStyles.wrapper}>
      <div className={`md:order-1 ${podiumStyles.sideCard}`}>
        <div className={podiumStyles.secondDot}>2nd</div>

        <div className="space-y-1">
          <div className="text-base font-bold text-gray-900">
            {top3[1] ? getRankingTeamName(top3[1]) : "TBA"}
          </div>
        </div>

        <div className="font-mono text-2xl font-bold text-slate-400">
          {top3[1] ? getRankingScore(top3[1]).toFixed(1) : "—"}
        </div>
      </div>

      <div className={podiumStyles.firstCard}>
        <div className={podiumStyles.goldBadge}>GOLD WINNER</div>
        <div className={podiumStyles.firstDot}>1st</div>

        <div className="space-y-1">
          <div className="text-xl font-bold text-gray-900">
            {getRankingTeamName(top3[0])}
          </div>
        </div>

        <div className="font-mono text-3xl font-bold text-blue-500">
          {getRankingScore(top3[0]).toFixed(1)}
        </div>
      </div>

      <div className={`md:order-3 ${podiumStyles.sideCard}`}>
        <div className={podiumStyles.thirdDot}>3rd</div>

        <div className="space-y-1">
          <div className="text-base font-bold text-gray-900">
            {top3[2] ? getRankingTeamName(top3[2]) : "TBA"}
          </div>
        </div>

        <div className="font-mono text-2xl font-bold text-amber-600">
          {top3[2] ? getRankingScore(top3[2]).toFixed(1) : "—"}
        </div>
      </div>
    </section>
  );
}