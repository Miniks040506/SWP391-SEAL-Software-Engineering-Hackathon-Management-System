import type { EventCriteriaResponse } from "@/api";
import type { UUID } from "@/types";
import { Chip } from "@mui/material";
import { roundScopeText } from "../../utils/criteriaView";

type EventCriteriaReadonlyListProps = {
    criteria: EventCriteriaResponse[];
    roundNameById?: Map<UUID, string>;
};

export function EventCriteriaReadonlyList({
    criteria,
    roundNameById
}: EventCriteriaReadonlyListProps) {
    if (criteria.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="font-bold text-slate-500">No criteria found.</p>
            </div>  
        );
    }
    
    return (
        <div className="space-y-4">
            {criteria.map((item) => (
                <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-black text-slate-950 dark:text-white">
                                    {item.displayOrder ?? "-"}. {item.effectiveName}
                                </h2>
                                <Chip 
                                    size="small"
                                    label={item.effectiveIsTechnical ? "Technical" : "Soft"}
                                    color={item.effectiveIsTechnical ? "primary" : "secondary"}
                                    sx={{ fontWeight: 800 }}
                                />
                                <Chip 
                                    size="small"
                                    label={item.isCustom ? "Custom" : "Template"}
                                    variant="outlined"
                                    sx={{ fontWeight: 800 }}
                                />
                            </div>
                            <p className="mt-2 text-sm font-medium text-slate-500">
                                {item.effectiveDescription || "No Description."}
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
                                Max: {item.effectiveMaxScore}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">
                                Weight: {item.effectiveWeight}
                            </span>
                        </div>
                    </div>
                    
                    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                                Scope
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {roundScopeText(item.appliesToRoundIds, roundNameById)}
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                                Rubric
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {item.effectiveRubric || "No rubric."}
                            </p>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}