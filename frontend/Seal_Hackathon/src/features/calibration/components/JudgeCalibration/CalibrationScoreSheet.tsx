import type { EventCriteriaResponse } from "@/types/criteria.types";
import { CalibrationCriteriaScoreInput } from "./CalibrationCriteriaScoreInput";

interface CalibrationScoreSheetProps {
    criteria: EventCriteriaResponse[];
    disabled?: boolean;
}

export const CalibrationScoreSheet = ({ criteria, disabled }: CalibrationScoreSheetProps) => {
    if (!criteria || criteria.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                No scoring criteria found.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-2 dark:border-slate-800">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        Score Sheet
                    </h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Please evaluate the sample submission based on the following criteria.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {criteria.map((criterion) => (
                    <CalibrationCriteriaScoreInput
                        key={criterion.id}
                        criterion={criterion}
                        disabled={disabled}
                    />
                ))}
            </div>
        </div>
    );
};
