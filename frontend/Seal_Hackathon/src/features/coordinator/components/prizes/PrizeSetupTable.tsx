import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import Tooltip from "@mui/material/Tooltip";
import type { PrizeResponse } from "@/types/prize.types";
import { PrizeScopeBadge } from "./PrizeScopeBadge";
import { PrizeValueDisplay } from "./PrizeValueDisplay";
import { AwardedTeamChip } from "./AwardedTeamChip";

type PrizeSetupTableProps = {
    prizes: PrizeResponse[];
    isLocked: boolean;
    onEdit: (prize: PrizeResponse) => void;
    onDelete: (prize: PrizeResponse) => void;
};

export const PrizeSetupTable = ({
    prizes,
    isLocked,
    onEdit,
    onDelete,
}: PrizeSetupTableProps) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                        <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Rank</th>
                        <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Scope</th>
                        <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Prize Title</th>
                        <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Value</th>
                        <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Sponsor</th>
                        <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Awarded Team</th>
                        <th className="px-5 py-3.5 text-center text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {!prizes || prizes.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-5 py-12 text-center text-sm font-medium text-slate-400">
                                No prizes have been configured yet.
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
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                            {prize.sponsorName || "—"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <AwardedTeamChip teamName={prize.awardedTeamName} />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Tooltip title={isLocked ? "Event is locked" : "Edit prize"}>
                                                <span>
                                                    <button
                                                        title="Edit"
                                                        onClick={() => onEdit(prize)}
                                                        disabled={isLocked}
                                                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-blue-400"
                                                    >
                                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                    </button>
                                                </span>
                                            </Tooltip>
                                            <Tooltip
                                                title={
                                                    isLocked
                                                        ? "Event is locked"
                                                        : isAwarded
                                                            ? "Clear award before deleting this prize"
                                                            : "Delete prize"
                                                }
                                            >
                                                <span>
                                                    <button
                                                        title="Delete"
                                                        onClick={() => onDelete(prize)}
                                                        disabled={isLocked || isAwarded}
                                                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-rose-900/50 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                                                    >
                                                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                                    </button>
                                                </span>
                                            </Tooltip>
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
