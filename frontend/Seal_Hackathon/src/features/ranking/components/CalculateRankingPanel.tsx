import { Button, CircularProgress } from "@mui/material";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

interface CalculateRankingPanelProps {
  roundName?: string;
  trackName?: string;
  gradingLocked: boolean;
  finalized: boolean;
  lastCalculatedTime?: string | null;
  rankingRowCount: number;
  uniqueSubmissionCount?: number;
  completedSubmissionCount?: number;
  judgeAssignmentCount?: number;
  isCalculating: boolean;
  onCalculate: () => void;
  onOpenGradingProgress: () => void;
}

export const CalculateRankingPanel = ({
  roundName,
  trackName,
  gradingLocked,
  finalized,
  lastCalculatedTime,
  rankingRowCount,
  uniqueSubmissionCount,
  completedSubmissionCount,
  judgeAssignmentCount,
  isCalculating,
  onCalculate,
  onOpenGradingProgress,
}: CalculateRankingPanelProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Ranking Calculation Status
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="font-medium">Round:</span>
            <span className="font-bold text-slate-900 dark:text-slate-300">
              {roundName || "All Rounds"}
            </span>
          </div>
          {trackName && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Track:</span>
              <span className="font-bold text-slate-900 dark:text-slate-300">
                {trackName}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="font-medium">Rows:</span>
            <span className="font-bold text-slate-900 dark:text-slate-300">
              {rankingRowCount}
            </span>
          </div>
          {uniqueSubmissionCount !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Unique submissions:</span>
              <span className="font-bold text-slate-900 dark:text-slate-300">
                {completedSubmissionCount ?? 0} / {uniqueSubmissionCount} complete
              </span>
            </div>
          )}
          {judgeAssignmentCount !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Judge assignments:</span>
              <span className="font-bold text-slate-900 dark:text-slate-300">
                {judgeAssignmentCount}
              </span>
            </div>
          )}
          {lastCalculatedTime && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Last calculated:</span>
              <span className="font-bold text-slate-900 dark:text-slate-300">
                {new Date(lastCalculatedTime).toLocaleString()}
              </span>
            </div>
          )}
          <p className="basis-full text-xs font-medium text-slate-500 dark:text-slate-400">
            Rows represent submissions. Disqualified submissions may appear as separate rows.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <Button
          variant="contained"
          color="primary"
          startIcon={
            isCalculating ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <CalculateOutlinedIcon />
            )
          }
          onClick={onCalculate}
          disabled={!gradingLocked || finalized || isCalculating}
          sx={{
            borderRadius: "10px",
            fontWeight: 700,
            textTransform: "none",
            px: 3,
            py: 1,
          }}
        >
          {isCalculating
            ? "Calculating..."
            : finalized
              ? "Ranking Finalized"
              : "Calculate Ranking"}
        </Button>
        {!gradingLocked && (
          <Button
            variant="text"
            size="small"
            endIcon={<ArrowForwardOutlinedIcon />}
            onClick={onOpenGradingProgress}
            sx={{ fontWeight: 700, textTransform: "none" }}
          >
            Open grading progress
          </Button>
        )}
      </div>
    </div>
  );
};
