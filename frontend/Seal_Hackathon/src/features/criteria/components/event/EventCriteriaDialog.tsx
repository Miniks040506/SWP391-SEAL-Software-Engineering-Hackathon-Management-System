import type { UUID } from "@/types/common.types";
import type { EventCriteriaDialogState, ScoringCriteriaResponse } from "@/types/criteria.types";
import type { RoundResponse } from "@/types/round.types";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useEventCriteriaDialog } from "../../hooks/useEventCriteriaDialog";
import { EventCriteriaDialogFields } from "./EventCriteriaDialogFields";

export type { EventCriteriaDialogState } from "@/types/criteria.types";

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
            
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 800 }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    sx={{ textTransform: "none", fontWeight: 900 }}
                >
                    {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Add criteria"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
