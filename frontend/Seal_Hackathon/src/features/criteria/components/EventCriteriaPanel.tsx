import type { EventDetailResponse, RoundResponse, UUID } from "@/types";
import { useEventCriteriaPanel } from "../hooks/useEventCriteriaPanel";
import { EventCriteriaPanelHeader } from "./event/EventCriteriaPanelHeader";
import { Alert } from "@mui/material";
import { EventCriteriaFilters } from "./event/EventCriteriaFilters";
import { EventCriteriaList } from "./event/EventCriteriaList";
import { EventCriteriaDialog } from "./event/EventCriteriaDialog";
import { EventCriteriaDetailsDialog } from "./event/EventCriteriaDetailsDialog";

type EventCriteriaPanelProps = {
    eventId: UUID;
    event?: EventDetailResponse | null;
    rounds?: RoundResponse[];
    canEdit?: boolean;
    readonlyReason?: string;
    title?: string;
    subtitle?: string;
};

export function EventCriteriaPanel({
    eventId,
    event,
    rounds = [],
    canEdit,
    readonlyReason,
    title = "Event Criteria",
    subtitle = "Configure the actual criteria used for scoring in this event.",
}: EventCriteriaPanelProps) {
    const {
        activeFilter,
        technicalFilter,
        setActiveFilter,
        setTechnicalFilter,
        dialogState,
        setDialogState,
        viewCriteria,
        setViewCriteria,
        effectiveCanEdit,
        effectiveReason,
        criteriaQuery,
        deleteMutation,
        criteria,
        templateOptions,
        roundNameById,
        openCreateDialog,
    } = useEventCriteriaPanel({
        eventId,
        event,
        rounds,
        canEdit,
        readonlyReason,
    }); 
    
    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <EventCriteriaPanelHeader
                title={title}
                subtitle={subtitle}
                canEdit={effectiveCanEdit}
                onRefresh={() => criteriaQuery.refetch()}
                onCreate={openCreateDialog}
            />
            
            <div className="space-y-5 px-7 py-6">
                {!effectiveCanEdit && effectiveReason && (
                    <Alert severity="info">{effectiveReason}</Alert>
                )}
                
                <EventCriteriaFilters 
                    activeFilter={activeFilter}
                    technicalFilter={technicalFilter}
                    onActiveFilterChange={setActiveFilter}
                    onTechnicalFilterChange={setTechnicalFilter}
                />
                
                <EventCriteriaList 
                    criteria={criteria}
                    roundNameById={roundNameById}
                    canEdit={effectiveCanEdit}
                    isLoading={criteriaQuery.isLoading}
                    isError={criteriaQuery.isError}
                    isDeleting={criteriaQuery.isPending}
                    onCreate={openCreateDialog}
                    onView={setViewCriteria}
                    onEdit={setDialogState}
                    onDelete={(criteriaId) => deleteMutation.mutate(criteriaId)}
                />
            </div>
            
            {dialogState && (
                <EventCriteriaDialog
                    open={Boolean(dialogState)}
                    state={dialogState}
                    eventId={eventId}
                    rounds={rounds}
                    templateOptions={templateOptions}
                    onClose={() => setDialogState(null)}
                />
            )}
            
            <EventCriteriaDetailsDialog 
                criteria={viewCriteria}
                onClose={() => setViewCriteria(null)}
            />
        </section>
    );
}