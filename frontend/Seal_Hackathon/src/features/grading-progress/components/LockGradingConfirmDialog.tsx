import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import type { RoundGradingProgressResponse } from "@/types/grading.types";

interface LockGradingConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    round: RoundGradingProgressResponse | null;
    isLocking: boolean;
}

interface StatTileProps {
    label: string;
    value: string;
    accentClass?: string;
}

const StatTile = ({ label, value, accentClass }: StatTileProps) => (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/70">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
        </p>
        <p className={`mt-0.5 text-lg font-black tabular-nums ${accentClass ?? "text-slate-900 dark:text-white"}`}>
            {value}
        </p>
    </div>
);

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
        <Dialog
            open={open}
            onClose={isLocking ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{ paper: { sx: { borderRadius: "20px" } } }}
        >
            <div className="flex items-center gap-3 border-b border-red-100 bg-gradient-to-r from-red-50 to-orange-50/60 px-6 py-4 dark:border-red-900/40 dark:from-red-950/40 dark:to-slate-900">
                <span className="gp-pop flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                    <LockOutlinedIcon />
                </span>
                <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                        Lock grading for {round.roundName}?
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        This action is irreversible from this screen.
                    </p>
                </div>
            </div>

            <DialogContent className="space-y-4" sx={{ px: 3, py: 3 }}>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    After locking, judges can no longer save drafts, update scores, or final-submit
                    scores for this round. Rankings are calculated from the scores confirmed so far.
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                    <StatTile
                        label="Completed"
                        value={`${round.completedAssignedSubmissions} / ${round.totalAssignedSubmissions}`}
                    />
                    <StatTile
                        label="Confirmed scores"
                        value={`${round.confirmedScoreCount} / ${round.expectedFinalScoreCount}`}
                        accentClass="text-emerald-600 dark:text-emerald-400"
                    />
                    <StatTile label="Pending" value={`${round.pendingSubmissions}`} />
                    <StatTile
                        label="Drafts"
                        value={`${round.draftSavedSubmissions}`}
                        accentClass="text-blue-600 dark:text-blue-400"
                    />
                </div>

                {isIncomplete && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 dark:border-amber-900/50 dark:bg-amber-900/20">
                        <WarningAmberOutlinedIcon
                            sx={{ fontSize: 18 }}
                            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                        />
                        <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                            Some assigned submissions are not fully submitted. Locking grading now may
                            exclude missing final scores from the ranking.
                        </p>
                    </div>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button
                    onClick={onClose}
                    disabled={isLocking}
                    variant="outlined"
                    color="inherit"
                    sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={isLocking}
                    variant="contained"
                    color="error"
                    className="gp-press"
                    startIcon={
                        isLocking ? <CircularProgress size={16} color="inherit" /> : <LockOutlinedIcon />
                    }
                    sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
                >
                    {isLocking ? "Locking…" : "Lock Grading"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
