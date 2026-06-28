import type { RankingResponse } from "@/types/ranking.types";
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

interface RankingPodiumProps {
    rankings: RankingResponse[];
}

export const RankingPodium = ({ rankings }: RankingPodiumProps) => {
    if (!rankings || rankings.length === 0) return null;

    const top3 = rankings.slice(0, 3);
    const first = top3[0];
    const second = top3[1];
    const third = top3[2];

    return (
        <div className="mb-12 mt-8 grid gap-4 sm:grid-cols-3 md:gap-12">
            {second ? (
                <div className="order-2 flex flex-col items-center justify-center space-y-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:order-1 sm:translate-y-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-slate-50 bg-slate-100 text-xl font-black text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                        2nd
                    </div>
                    <div className="space-y-1">
                        <div className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{second.teamName}</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{second.trackName || "-"}</div>
                    </div>
                    <div className="font-mono text-2xl font-black text-slate-400">
                        {Number(second.totalScore).toFixed(2)}
                    </div>
                </div>
            ) : (
                <div className="order-2 hidden sm:block sm:order-1" />
            )}

            {first ? (
                <div className="order-1 relative flex flex-col items-center justify-center space-y-5 rounded-3xl border-4 border-blue-500 bg-white p-10 text-center shadow-xl shadow-blue-100 transition-transform hover:-translate-y-1 dark:bg-slate-900 dark:shadow-blue-900/20 sm:order-2 sm:-translate-y-4">
                    <div className="absolute -top-4 rounded-full bg-blue-500 px-4 py-1.5 text-xs font-black tracking-wider text-white shadow-lg flex items-center gap-1">
                        <WorkspacePremiumIcon fontSize="small" />
                        CHAMPION
                    </div>
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-blue-50 bg-blue-100 text-3xl font-black text-blue-600 dark:border-blue-900/50 dark:bg-blue-900/30 dark:text-blue-400">
                        1st
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl font-black text-slate-900 dark:text-white line-clamp-2">{first.teamName}</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400">{first.trackName || "-"}</div>
                    </div>
                    <div className="font-mono text-4xl font-black text-blue-600 dark:text-blue-400">
                        {Number(first.totalScore).toFixed(2)}
                    </div>
                </div>
            ) : (
                <div className="order-1 hidden sm:block sm:order-2" />
            )}

            {third ? (
                <div className="order-3 flex flex-col items-center justify-center space-y-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:translate-y-8">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-amber-50 bg-amber-50 text-xl font-black text-amber-600 dark:border-amber-900/20 dark:bg-amber-900/30 dark:text-amber-500">
                        3rd
                    </div>
                    <div className="space-y-1">
                        <div className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{third.teamName}</div>
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{third.trackName || "-"}</div>
                    </div>
                    <div className="font-mono text-2xl font-black text-amber-600 dark:text-amber-500">
                        {Number(third.totalScore).toFixed(2)}
                    </div>
                </div>
            ) : (
                <div className="order-3 hidden sm:block" />
            )}
        </div>
    );
};
