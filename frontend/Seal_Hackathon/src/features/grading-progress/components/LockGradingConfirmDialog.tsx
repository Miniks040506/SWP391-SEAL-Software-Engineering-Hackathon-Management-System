import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
    Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import type { RoundGradingProgressResponse } from "@/types/grading.types";

interface LockGradingConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    round: RoundGradingProgressResponse | null;
    isLocking: boolean;
}

export const LockGradingConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    round,
    isLocking,
}: LockGradingConfirmDialogProps) => {
    if (!round) return null;

    const isIncomplete =
        round.completedAssignedSubmissions < round.totalAssignedSubmissions ||
        round.confirmedScoreCount < round.expectedFinalScoreCount;

    return (
        <Dialog open={open} onClose={isLocking ? undefined : onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
                <LockOutlinedIcon color="error" /> Lock grading for this round?
            </DialogTitle>
            <DialogContent dividers className="space-y-4">
                <Typography variant="body1" className="text-slate-700">
                    After locking grading, judges cannot save drafts, update scores, or final-submit scores for this round.
                </Typography>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                    <ul className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <li className="flex justify-between">
                            <span>Completed submissions:</span>
                            <span className="font-black">{round.completedAssignedSubmissions} / {round.totalAssignedSubmissions}</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Confirmed scores:</span>
                            <span className="font-black text-emerald-600">{round.confirmedScoreCount} / {round.expectedFinalScoreCount}</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Pending submissions:</span>
                            <span className="font-black">{round.pendingSubmissions}</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Draft submissions:</span>
                            <span className="font-black text-blue-600">{round.draftSavedSubmissions}</span>
                        </li>
                    </ul>
                </div>

                {isIncomplete && (
                    <Alert severity="warning" sx={{ borderRadius: "12px", fontWeight: 600 }}>
                        Warning: Some assigned submissions are not fully submitted. Locking grading may exclude missing final scores from ranking.
                    </Alert>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    onClick={onClose}
                    disabled={isLocking}
                    variant="outlined"
                    color="inherit"
                    sx={{ borderRadius: "8px", fontWeight: 700, textTransform: "none" }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={isLocking}
                    variant="contained"
                    color="error"
                    startIcon={<LockOutlinedIcon />}
                    sx={{ borderRadius: "8px", fontWeight: 700, textTransform: "none" }}
                >
                    {isLocking ? "Locking..." : "Lock Grading"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};