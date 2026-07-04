import type { UUID } from "@/types/common.types";
import type { ScoringCriteriaDialogState, ScoringCriteriaResponse } from "@/types/criteria.types";
import { Alert, CircularProgress } from "@mui/material";
import { ScoringCriteriaCard } from "./ScoringCriteriaCard";

type ScoringCriteriaListProps = {
    criteria: ScoringCriteriaResponse[];
    isLoading: boolean;
    isError: boolean;
    isActivating?: boolean;
    isDeleting?: boolean;
    onEdit: (state: ScoringCriteriaDialogState) => void;
    onToggleActive: (criteria: ScoringCriteriaResponse) => void;
    onDelete: (criteriaId: UUID) => void;
}

export function ScoringCriteriaList({
    criteria,
    isLoading,
    isError,
    isActivating, 
    isDeleting,
    onEdit,
    onToggleActive,
    onDelete
}: ScoringCriteriaListProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center py-14">
                <CircularProgress />
            </div>
        );
    }
    
    if (isError) {
        return (
            <div className="p-5">
                <Alert severity="error">Failed to load scoring criteria.</Alert>
            </div>
        );
    }
    
    if (criteria.length === 0) {
        return (
            <div className="px-5 py-14 text-center">
                <p className="font-bold text-slate-500">No scoring criteria found.</p>
            </div>
        );
    }
    
    return (
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {criteria.map((item) => (
                <ScoringCriteriaCard 
                    key={item.id}
                    criteria={item}
                    isActivating={isActivating}
                    isDeleting={isDeleting}
                    onEdit={onEdit}
                    onToggleActive={onToggleActive}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
