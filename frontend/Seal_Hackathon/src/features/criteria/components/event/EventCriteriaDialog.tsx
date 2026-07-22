import type { UUID } from "@/types/common.types";
import type { EventCriteriaDialogState, ScoringCriteriaResponse } from "@/types/criteria.types";
import type { RoundResponse } from "@/types/round.types";
import { Button, Dialog } from "@mui/material";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
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

const DIALOG_PAPER_SX = {
    "& .MuiDialog-paper": {
        borderRadius: "20px",
        overflow: "hidden",
        backgroundImage: "none",
    },
} as const;

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
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            sx={DIALOG_PAPER_SX}
            classes={{ paper: "bg-white dark:bg-slate-900" }}
        >
            {/* Gradient header — shared chrome across edit-event popups */}
            <div className="relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-rose-950 px-6 py-5">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-rose-500/25 blur-2xl"
                />
                <div className="relative flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-pink-400 text-white shadow-md">
                        <ChecklistOutlinedIcon />
                    </span>
                    <div>
                        <h2 className="text-lg font-black text-white">
                            {isEdit ? "Edit Event Criteria" : "Add Event Criteria"}
                        </h2>
                        <p className="text-xs font-medium text-slate-400">
                            {isEdit
                                ? "Adjust overrides, round scope, and activation"
                                : "Start from a global template or create custom event-only criteria"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-h-[62vh] overflow-y-auto px-6 py-5">
                <EventCriteriaDialogFields
                    values={values}
                    setValues={setValues}
                    isEdit={isEdit}
                    rounds={rounds}
                    templateOptions={templateOptions}
                />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 700 }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    sx={{
                        textTransform: "none",
                        borderRadius: "10px",
                        fontWeight: 800,
                        boxShadow: "none",
                        bgcolor: "#e11d48",
                        "&:hover": { bgcolor: "#be123c" },
                    }}
                >
                    {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Add criteria"}
                </Button>
            </div>
        </Dialog>
    );
}
