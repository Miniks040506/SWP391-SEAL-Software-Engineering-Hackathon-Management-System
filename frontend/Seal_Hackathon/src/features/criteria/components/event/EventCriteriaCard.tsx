import type { EventCriteriaResponse } from "@/api";
import type { UUID } from "@/types";

type EventCriteriaCardProps = {
    criteria: EventCriteriaResponse;
    canEdit: boolean;
    roundNameById: Map<UUID, string>;
    isDeleting?: boolean;
    onView: (criteria: EventCriteriaResponse) => void;
    onEdit: (state) => void;
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
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        
                    </div>
                </div>
            </div>
        </div>
    )
}