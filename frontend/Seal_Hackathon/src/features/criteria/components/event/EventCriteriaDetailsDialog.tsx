import type { EventCriteriaResponse } from "@/types";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

type EventCriteriaDetailsDialogProps = {
    criteria: EventCriteriaResponse | null;
    onClose: () => void;
};

export function EventCriteriaDetailsDialog({
    criteria,
    onClose
}: EventCriteriaDetailsDialogProps) {
    return (
        <Dialog open={Boolean(criteria)} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ fontWeight: 900 }}>
                {criteria?.effectiveName || "Criteria details"}
            </DialogTitle>
            <DialogContent dividers>
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                            Description
                        </p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                            {criteria?.effectiveDescription || "No description."}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                            Rubric
                        </p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                            {criteria?.effectiveRubric || "No rubric."}
                        </p>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}