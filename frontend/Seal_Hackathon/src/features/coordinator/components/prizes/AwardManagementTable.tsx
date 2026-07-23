import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";

import type { PrizeResponse } from "@/types/prize.types";
import { getMedal, formatOrdinal, formatPrizeValue } from "./awardUi";

type AwardManagementTableProps = {
  prizes: PrizeResponse[];
  canAssignPrizes: boolean;
  onManualAward: (prize: PrizeResponse) => void;
  onClearAward: (prize: PrizeResponse) => void;
};

function ScopePill({ trackName }: { trackName?: string }) {
  if (trackName) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30">
        <WorkspacePremiumOutlinedIcon sx={{ fontSize: 13 }} />
        {trackName}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700 ring-1 ring-inset ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30">
      <PublicOutlinedIcon sx={{ fontSize: 13 }} />
      Overall
    </span>
  );
}

export const AwardManagementTable = ({
  prizes,
  canAssignPrizes,
  onManualAward,
  onClearAward,
}: AwardManagementTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
            {["Rank", "Scope", "Prize", "Value", "Winner", "Actions"].map(
              (h, i) => (
                <th
                  key={h}
                  className={[
                    "px-5 py-3.5 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400",
                    i === 5 ? "text-center" : "text-left",
                  ].join(" ")}
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {prizes.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <EmojiEventsOutlinedIcon sx={{ fontSize: 30 }} />
                  </div>
                  <p className="text-base font-black text-slate-700 dark:text-slate-200">
                    No prizes match your filters
                  </p>
                  <p className="max-w-sm text-sm font-medium text-slate-400">
                    Adjust the filters above, or configure prizes for this event
                    first.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            prizes.map((prize) => {
              const isAwarded = Boolean(prize.awardedTeamId);
              const medal = getMedal(prize.rankPosition);
              const value = formatPrizeValue(prize.value, prize.currency);
              return (
                <tr
                  key={prize.id}
                  className={[
                    "group transition-colors",
                    isAwarded
                      ? "bg-emerald-50/40 hover:bg-emerald-50/70 dark:bg-emerald-500/5 dark:hover:bg-emerald-500/10"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  ].join(" ")}
                >
                  {/* Rank medal */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={[
                          "flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-sm ring-1 ring-inset ring-white/20",
                          medal.gradient,
                        ].join(" ")}
                      >
                        <span className="text-xs font-black tabular-nums drop-shadow">
                          {prize.rankPosition ?? "-"}
                        </span>
                      </span>
                      <span
                        className={["text-xs font-bold", medal.text].join(" ")}
                      >
                        {formatOrdinal(prize.rankPosition)}
                      </span>
                    </div>
                  </td>

                  {/* Scope */}
                  <td className="px-5 py-4">
                    <ScopePill trackName={prize.trackName} />
                  </td>

                  {/* Prize title + sponsor */}
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {prize.title}
                    </p>
                    {prize.sponsorName && (
                      <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                        by {prize.sponsorName}
                      </p>
                    )}
                  </td>

                  {/* Value */}
                  <td className="px-5 py-4">
                    {value ? (
                      <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black tabular-nums text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                        {value}
                      </span>
                    ) : (
                      <span className="text-xs italic text-slate-400">
                        No value
                      </span>
                    )}
                  </td>

                  {/* Winner */}
                  <td className="px-5 py-4">
                    {isAwarded ? (
                      <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-emerald-500 to-teal-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                          <EmojiEventsIcon sx={{ fontSize: 14 }} />
                          {prize.awardedTeamName}
                        </span>
                        {prize.awardedAt && (
                          <p className="mt-1 text-[11px] text-slate-400">
                            {new Date(prize.awardedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Not awarded
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        title={
                          canAssignPrizes
                            ? isAwarded
                              ? "Reassign winner"
                              : "Award prize"
                            : "Publish results before assigning prizes"
                        }
                        disabled={!canAssignPrizes}
                        onClick={() => onManualAward(prize)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-600 transition-colors hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20 dark:disabled:border-slate-700 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
                      >
                        <EmojiEventsOutlinedIcon sx={{ fontSize: 14 }} />
                        {isAwarded ? "Reassign" : "Award"}
                      </button>
                      <button
                        type="button"
                        title="Clear award"
                        disabled={!isAwarded}
                        onClick={() => onClearAward(prize)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-600 transition-colors hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 disabled:cursor-not-allowed disabled:opacity-30 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
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
