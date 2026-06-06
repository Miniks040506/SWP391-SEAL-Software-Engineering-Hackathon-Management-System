import type { EventCriteriaDialogState, EventCriteriaResponse, UUID } from "@/types";
import { Alert, Button, CircularProgress } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { EventCriteriaCard } from "./EventCriteriaCard";

type EventCriteriaListProps = {
    criteria: EventCriteriaResponse[];
    roundNameById: Map<UUID, string>;
    canEdit: boolean;
    isLoading: boolean;
    isError: boolean;
    isDeleting: boolean;
    onCreate: () => void;
    onView: (criteria: EventCriteriaResponse) => void;
    onEdit: (state: EventCriteriaDialogState) => void;
    onDelete: (criteriaId: UUID) => void;
};

export function EventCriteriaList({
    criteria,
    roundNameById,
    canEdit,
    isLoading,
    isError,
    isDeleting,
    onCreate,
    onView,
    onEdit,
    onDelete
}: EventCriteriaListProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <CircularProgress />
            </div>
        );
    }
    
    if (isError) {
        return (
            <Alert severity="error">
                Failed to load event criteria.
            </Alert>
        );
    }
    
    if (criteria.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800/60">
                <p className="font-bold text-slate-500">
                    No event criteria found.
                </p>
                {canEdit && (
                    <Button
                        className="mt-4"
                        variant="contained"
                        startIcon={<AddOutlinedIcon />}
                        onClick={onCreate}
                        sx={{ textTransform: "none", fontWeight: 900 }}
                    >
                        Add first criteria
                    </Button>
                )}
            </div>
        );
    }
    
    return (
        <div className="space-y-3">
            {criteria.map((item) => (
                <EventCriteriaCard 
                    key={item.id}
                    criteria={item}
                    canEdit={canEdit}
                    roundNameById={roundNameById}
                    isDeleting={isDeleting}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}