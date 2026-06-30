import { Button, CircularProgress } from "@mui/material";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";

interface CalculateRankingPanelProps {
  roundName?: string;
  trackName?: string;
  gradingLocked: boolean;
  lastCalculatedTime?: string | null;
  rankingRowCount: number;
  isCalculating: boolean;
  onCalculate: () => void;
}

export const CalculateRankingPanel = ({
  roundName,
  trackName,
  gradingLocked,
  lastCalculatedTime,
  rankingRowCount,
  isCalculating,
  onCalculate,
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
          {lastCalculatedTime && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Last calculated:</span>
              <span className="font-bold text-slate-900 dark:text-slate-300">
                {new Date(lastCalculatedTime).toLocaleString()}
              </span>
            </div>
          )}
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
          disabled={!gradingLocked || isCalculating}
          sx={{
            borderRadius: "10px",
            fontWeight: 700,
            textTransform: "none",
            px: 3,
            py: 1,
          }}
        >
          {isCalculating ? "Calculating..." : "Calculate Ranking"}
        </Button>
        {!gradingLocked && (
          <span className="text-xs font-semibold text-red-500">
            Grading must be locked first
          </span>
        )}
      </div>
    </div>
  );
};
