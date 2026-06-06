import type { EventCriteriaDialogState, RoundResponse, ScoringCriteriaResponse, UUID } from "@/types";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useEventCriteriaDialog } from "../../hooks/useEventCriteriaDialog";
import { EventCriteriaDialogFields } from "./EventCriteriaDialogFields";

type EventCriteriaDialogProps = {
    open: boolean;
    state: EventCriteriaDialogState | null;
    eventId: UUID;
    rounds: RoundResponse[];
    templateOptions: ScoringCriteriaResponse[];
    onClose: () => void;
};

export function EventCriteriaDialog({
    open,
    state,
    eventId,
    rounds,
    templateOptions,
    onClose
}: EventCriteriaDialogProps) {
    
    const { isEdit, values, setValues, isSubmitting, handleSubmit } = useEventCriteriaDialog({ eventId, state, onClose });
    
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ fontWeight: 900 }}>
                {isEdit ? "Edit Event Criteria" : "Add Event Criteria"}
            </DialogTitle>
            
            <DialogContent dividers>
                <EventCriteriaDialogFields
                    values={values}
                    setValues={setValues}
                    isEdit={isEdit}
                    rounds={rounds}
                    templateOptions={templateOptions}
                />
            </DialogContent>
            
            <DialogActions>
                
            </DialogActions>
        </Dialog>
    )
}