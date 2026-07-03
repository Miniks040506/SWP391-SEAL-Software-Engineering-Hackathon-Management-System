import { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AssessmentIcon from "@mui/icons-material/Assessment";

export type CalibrationStatusType = "UPCOMING" | "OPEN" | "CLOSED" | "SUBMITTED" | "DISTRIBUTION_PUBLISHED";

interface CalibrationSubmitBarProps {
    status: CalibrationStatusType;
    isSubmitting?: boolean;
    onSubmit: () => void;
    onViewDistribution?: () => void;
}

export const CalibrationSubmitBar = ({
    status,
    isSubmitting = false,
    onSubmit,
    onViewDistribution,
}: CalibrationSubmitBarProps) => {
    const [open, setOpen] = useState(false);

    const handleConfirm = () => {
        setOpen(false);
        onSubmit();
    };

    let content = null;

    if (status === "UPCOMING") {
        content = (
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Calibration is not open yet.
            </span>
        );
    } else if (status === "CLOSED") {
        content = (
            <span className="text-sm font-bold text-rose-500 dark:text-rose-400">
                Calibration window is closed.
            </span>
        );
    } else if (status === "SUBMITTED") {
        content = (
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                Scores submitted. Waiting for coordinator to publish the distribution.
            </span>
        );
    } else if (status === "DISTRIBUTION_PUBLISHED") {
        content = (
            <div className="flex w-full items-center justify-between">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    Distribution has been published.
                </span>
                <Button
                    variant="contained"
                    startIcon={<AssessmentIcon />}
                    onClick={onViewDistribution}
                    sx={{ textTransform: "none", fontWeight: 800, borderRadius: "10px" }}
                >
                    View Distribution
                </Button>
            </div>
        );
    } else if (status === "OPEN") {
        content = (
            <div className="flex w-full items-center justify-end">
                <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    disabled={isSubmitting}
                    onClick={() => setOpen(true)}
                    sx={{
                        textTransform: "none",
                        fontWeight: 800,
                        borderRadius: "10px",
                        bgcolor: "#059669",
                        "&:hover": { bgcolor: "#047857" },
                        px: 4,
                    }}
                >
                    {isSubmitting ? "Submitting..." : "Submit Calibration Scores"}
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="mx-auto flex w-full max-w-7xl items-center justify-center md:justify-end">
                {content}
            </div>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                slotProps={{ paper: { sx: { borderRadius: "16px" } } }}
            >
                <DialogTitle sx={{ fontWeight: 900, color: "slate.900" }}>Submit calibration scores?</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontWeight: 500, color: "slate.600" }}>
                        Calibration scores are used to compare scoring consistency. They do not affect final ranking.
                        Once submitted, you will not be able to edit these scores.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setOpen(false)} sx={{ textTransform: "none", fontWeight: 700, color: "slate.500" }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        variant="contained"
                        sx={{ textTransform: "none", fontWeight: 800, borderRadius: "10px", bgcolor: "#059669", "&:hover": { bgcolor: "#047857" } }}
                    >
                        Submit scores
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
