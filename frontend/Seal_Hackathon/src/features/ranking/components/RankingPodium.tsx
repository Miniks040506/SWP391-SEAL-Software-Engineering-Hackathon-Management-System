import type { RankingResponse } from "@/types/ranking.types";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";

interface RankingPodiumProps {
  rankings: RankingResponse[];
}

export const RankingPodium = ({ rankings }: RankingPodiumProps) => {
  if (!rankings || rankings.length === 0) return null;

  const top3 = rankings
    .filter((ranking) =>
      ranking.advanceReason !== "DISQUALIFIED" &&
      ranking.submissionStatus !== "DISQUALIFIED",
    )
    .slice(0, 3);
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  return (
    <div className="mb-12 mt-8 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end md:gap-x-8">
      {second ? (
        <div className="group relative overflow-hidden rounded-b-2xl border-t border-slate-300 bg-slate-100/70 px-6 pb-7 pt-6 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 dark:border-slate-600 dark:bg-slate-400/8 md:col-span-4 md:translate-y-4">
          <EmojiEventsRoundedIcon
            aria-hidden
            className="pointer-events-none absolute bottom-2 right-4 text-[112px] text-slate-400/20 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 dark:text-slate-400/10"
          />
          <div className="relative space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-300 text-sm font-extrabold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                2
              </span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                2nd place
              </span>
            </div>
            <p className="line-clamp-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {second.teamName}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {second.trackName || "General"}
            </p>
            <p className="font-mono text-5xl font-extrabold tracking-tight text-slate-600 dark:text-slate-200">
              {Number(second.totalScore).toFixed(2)}
            </p>
          </div>
        </div>
      ) : (
        <div className="hidden md:col-span-4 md:block" />
      )}

      {first ? (
        <div className="group relative order-1 overflow-hidden rounded-b-2xl border-t-2 border-amber-500 bg-amber-50/80 px-6 pb-8 pt-6 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 dark:border-amber-400 dark:bg-amber-400/8 md:order-2 md:col-span-5 md:-translate-y-4">
          <EmojiEventsRoundedIcon
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-3 text-[148px] text-amber-500/20 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 dark:text-amber-400/10"
          />
          <div className="relative space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-sm font-extrabold text-amber-950 shadow-sm shadow-amber-500/30">
                1
              </span>
              <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                Champion
              </span>
            </div>
            <p className="line-clamp-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              {first.teamName}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {first.trackName || "General"}
            </p>
            <p className="font-mono text-6xl font-extrabold tracking-tight text-amber-500 dark:text-amber-400 md:text-7xl">
              {Number(first.totalScore).toFixed(2)}
            </p>
          </div>
        </div>
      ) : (
        <div className="hidden md:order-2 md:col-span-5 md:block" />
      )}

      {third ? (
        <div className="group relative order-3 overflow-hidden rounded-b-2xl border-t border-orange-600/60 bg-orange-50/70 px-6 pb-6 pt-6 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 dark:border-orange-500/50 dark:bg-orange-500/8 md:col-span-3 md:translate-y-8">
          <EmojiEventsRoundedIcon
            aria-hidden
            className="pointer-events-none absolute bottom-1 right-3 text-[96px] text-orange-600/15 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 dark:text-orange-500/10"
          />
          <div className="relative space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-600 text-xs font-extrabold text-orange-50">
                3
              </span>
              <span className="text-sm font-bold text-orange-700 dark:text-orange-500">
                3rd place
              </span>
            </div>
            <p className="line-clamp-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {third.teamName}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {third.trackName || "General"}
            </p>
            <p className="font-mono text-4xl font-extrabold tracking-tight text-orange-700 dark:text-orange-500">
              {Number(third.totalScore).toFixed(2)}
            </p>
          </div>
        </div>
      ) : (
        <div className="hidden md:col-span-3 md:block" />
      )}
    </div>
  );
};
