import type { EventCriteriaResponse } from "@/types/criteria.types";
import { Button, Dialog } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

type EventCriteriaDetailsDialogProps = {
    criteria: EventCriteriaResponse | null;
    onClose: () => void;
};

const DIALOG_PAPER_SX = {
    "& .MuiDialog-paper": {
        borderRadius: "20px",
        overflow: "hidden",
        backgroundImage: "none",
    },
} as const;

export function EventCriteriaDetailsDialog({
    criteria,
    onClose
}: EventCriteriaDetailsDialogProps) {
    return (
        <Dialog
            open={Boolean(criteria)}
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
                        <VisibilityOutlinedIcon />
                    </span>
                    <div>
                        <h2 className="text-lg font-black text-white">
                            {criteria?.effectiveName || "Criteria details"}
                        </h2>
                        <p className="text-xs font-medium text-slate-400">
                            Full description and grading rubric
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 px-6 py-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Description
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-slate-700 dark:text-slate-200">
                        {criteria?.effectiveDescription || "No description."}
                    </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Rubric
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-slate-700 dark:text-slate-200">
                        {criteria?.effectiveRubric || "No rubric."}
                    </p>
                </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 700 }}
                >
                    Close
                </Button>
            </div>
        </Dialog>
    );
}
