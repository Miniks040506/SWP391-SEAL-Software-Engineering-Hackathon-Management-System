import { EmojiEventsOutlined as EmojiEventsOutlinedIcon, ClearOutlined as ClearOutlinedIcon } from "@mui/icons-material";
import type { PrizeResponse } from "@/types/prize.types";
import { PrizeScopeBadge } from "./PrizeScopeBadge";
import { PrizeValueDisplay } from "./PrizeValueDisplay";
import { AwardedTeamChip } from "./AwardedTeamChip";

type AwardManagementTableProps = {
  prizes: PrizeResponse[];
  onManualAward: (prize: PrizeResponse) => void;
  onClearAward: (prize: PrizeResponse) => void;
};

export const AwardManagementTable = ({
  prizes,
  onManualAward,
  onClearAward,
}: AwardManagementTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Rank</th>
            <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Scope</th>
            <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Prize Title</th>
            <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Value</th>
            <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Winner</th>
            <th className="px-5 py-3.5 text-center text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {prizes.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center text-sm font-medium text-slate-400">
                No prizes configured.
              </td>
            </tr>
          ) : (
            prizes.map((prize) => {
              const isAwarded = Boolean(prize.awardedTeamId);
              return (
                <tr key={prize.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-4">
                    <span className="text-base font-black text-slate-700 dark:text-slate-200">
                      #{prize.rankPosition ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <PrizeScopeBadge trackName={prize.trackName} />
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-900 dark:text-white">{prize.title}</span>
                  </td>
                  <td className="px-5 py-4">
                    <PrizeValueDisplay value={prize.value} currency={prize.currency} />
                  </td>
                  <td className="px-5 py-4">
                    <AwardedTeamChip teamName={prize.awardedTeamName} />
                    {prize.awardedAt && (
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {new Date(prize.awardedAt).toLocaleDateString()}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="Manual Award"
                        onClick={() => onManualAward(prize)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-600 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        <EmojiEventsOutlinedIcon sx={{ fontSize: 14 }} />
                        Award
                      </button>
                      <button
                        title="Clear Award"
                        disabled={!isAwarded}
                        onClick={() => onClearAward(prize)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                      >
                        <ClearOutlinedIcon sx={{ fontSize: 14 }} />
                        Clear
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
