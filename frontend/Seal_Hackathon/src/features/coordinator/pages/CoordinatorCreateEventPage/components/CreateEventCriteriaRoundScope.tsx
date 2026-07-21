import type { CreateEventFormValues } from "@/features/coordinator/schemas/createEvent.schema";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import { Alert } from "@mui/material";
import { useFormContext } from "react-hook-form";

type CreateEventCriteriaRoundScopeProps = {
    criteriaIndex: number;
    rounds: CreateEventFormValues["rounds"];
    selectedRoundIds: string[];
};

export function CreateEventCriteriaRoundScope({
    criteriaIndex,
    rounds,
    selectedRoundIds,
}: CreateEventCriteriaRoundScopeProps) {
    const { setValue } = useFormContext<CreateEventFormValues>();

    const toggleRound = (roundId: string, checked: boolean) => {
        setValue(
            `criteria.${criteriaIndex}.appliesToRoundLocalIds`,
            checked
                ? Array.from(new Set([...selectedRoundIds, roundId]))
                : selectedRoundIds.filter((id) => id !== roundId),
        );
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
            <p className="text-sm font-black text-slate-900 dark:text-white">
                Apply to rounds
            </p>
            <p className="mt-0.5 mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                No selection means all rounds.
            </p>

            {rounds.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: "12px" }}>
                    Create rounds before selecting a specific round scope.
                </Alert>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {rounds.map((round) => {
                        const checked = selectedRoundIds.includes(round.id);

                        return (
                            <button
                                key={round.id}
                                type="button"
                                role="checkbox"
                                aria-checked={checked}
                                onClick={() => toggleRound(round.id, !checked)}
                                className={[
                                    "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-black transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60",
                                    checked
                                        ? "border-rose-400/60 bg-rose-50 text-rose-600 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-300"
                                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-slate-200",
                                ].join(" ")}
                            >
                                {checked && <CheckOutlinedIcon sx={{ fontSize: 14 }} />}
                                {round.orderIndex}. {round.roundName || `Round ${round.orderIndex}`}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
