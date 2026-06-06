import type { EventCriteriaDialogState, RoundResponse, ScoringCriteriaResponse, UUID } from "@/types";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useEventCriteriaDialog } from "../../hooks/useEventCriteriaDialog";

type EventCriteriaDialogProps = {
    open: boolean;
    state: EventCriteriaDialogState | null;
    eventId: UUID;
    rounds: RoundResponse[];
    templateOptions: ScoringCriteriaResponse[];
    onClose: () => void;
}

export function EventCriteriaDialog({
    open,
    state,
    eventId,
    rounds,
    templateOptions,
    onClose
}: EventCriteriaDialogProps) {
    
    const { isEdit } = useEventCriteriaDialog({ eventId, state, onClose })
    
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ fontWeight: 900 }}>
                {isEdit ? "Edit Event Criteria" : "Add Event Criteria"}
            </DialogTitle>
            
            <DialogContent>
                
            </DialogContent>
            
            <DialogActions>
                
            </DialogActions>
        </Dialog>
    )
}