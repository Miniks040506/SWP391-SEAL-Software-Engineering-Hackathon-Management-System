import type { TeamDetailedScoreResponse } from "@/types/ranking.types";

export type TeamScoreSummaryCardProps = Pick<
  TeamDetailedScoreResponse,
  | "totalScore"
  | "rankPosition"
  | "trackName"
  | "roundName"
  | "advanced"
  | "finalRound"
>;

export const TeamScoreSummaryCard = ({
  totalScore,
  rankPosition,
  trackName,
  roundName,
  advanced,
  finalRound,
}: TeamScoreSummaryCardProps) => {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-5">
      <div>
        <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Total score
        </dt>
        <dd className="mt-2 text-3xl font-black tabular-nums text-slate-950 dark:text-white">
          {totalScore}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Rank
        </dt>
        <dd className="mt-2 text-3xl font-black tabular-nums text-slate-950 dark:text-white">
          #{rankPosition}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Track
        </dt>
        <dd className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">
          {trackName}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Round
        </dt>
        <dd className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">
          {roundName}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Status
        </dt>
        <dd
          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${finalRound ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" : advanced ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"}`}
        >
          {finalRound ? "Final result" : advanced ? "Advanced" : "Not advanced"}
        </dd>
      </div>
    </dl>
  );
};
