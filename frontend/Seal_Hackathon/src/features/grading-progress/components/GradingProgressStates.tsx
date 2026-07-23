import { Button } from "@mui/material";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

/**
 * Skeleton mirroring the mission-control layout (hero + overview band +
 * two rows) so the page doesn't jump when real data lands.
 */
export const GradingProgressSkeleton = () => (
    <div className="mx-auto max-w-7xl space-y-6" aria-busy="true" aria-label="Loading grading progress">
        <div className="gp-shimmer h-40 rounded-3xl bg-slate-100 dark:bg-slate-800/70" />
        <div className="gp-shimmer h-56 rounded-3xl bg-slate-100 dark:bg-slate-800/70" />
        <div className="gp-shimmer h-24 rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
        <div className="gp-shimmer h-24 rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
    </div>
);

interface GradingProgressErrorStateProps {
    message: string;
    onRetry: () => void;
}

export const GradingProgressErrorState = ({ message, onRetry }: GradingProgressErrorStateProps) => (
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-900/25 dark:text-red-400">
            <ErrorOutlineOutlinedIcon />
        </span>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{message}</p>
        <Button
            variant="outlined"
            onClick={onRetry}
            sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
        >
            Retry
        </Button>
    </div>
);
