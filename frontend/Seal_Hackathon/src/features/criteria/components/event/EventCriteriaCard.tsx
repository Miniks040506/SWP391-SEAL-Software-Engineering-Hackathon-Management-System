import type { EventCriteriaResponse } from "@/api";
import type { UUID } from "@/types";
import type { EventCriteriaDialogState } from "@/features/criteria/components/event/EventCriteriaDialog";
import { Chip } from "@mui/material";

type EventCriteriaCardProps = {
    criteria: EventCriteriaResponse;
    canEdit: boolean;
    roundNameById: Map<UUID, string>;
    isDeleting?: boolean;
    onView: (criteria: EventCriteriaResponse) => void;
    onEdit: (state: EventCriteriaDialogState) => void;
    onDelete: (criteriaId: UUID) => void;
};

export function EventCriteriaCard({
    criteria,
    canEdit,
    roundNameById,
    isDeleting,
    onView,
    onEdit,
    onDelete
}: EventCriteriaCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-black text-slate-950 dark:text-white">
                            {criteria.displayOrder ?? "-"}. {criteria.effectiveName}
                        </p>
                        <Chip 
                            size="small"
                            label={criteria.effectiveIsTechnical ? "Technical" : "Soft"}
                            color={criteria.effectiveIsTechnical ? "primary" : "secondary"}
                            sx={{ fontWeight: 800 }}
                        />                          
                        <Chip
                            size="small"
                            label={criteria.isActive ? "Active" : "Inactive"}
                            color={criteria.isActive ? "success" : "default"}
                            sx={{ fontWeight: 800 }}
                        />
                        <Chip
                            size="small"
                            label={criteria.isCustom ? "Custom" : "Template"}
                            variant="outlined"
                            sx={{ fontWeight: 800 }}
                        />
                    </div>
                    
                    <p className="mt-2 text-sm font-medium text-slate-500">
                        {criteria.effectiveDescription || "No description."}
                    </p>
                    
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                        
                    </div>
                </div>
            </div>
        </div>
    )
}