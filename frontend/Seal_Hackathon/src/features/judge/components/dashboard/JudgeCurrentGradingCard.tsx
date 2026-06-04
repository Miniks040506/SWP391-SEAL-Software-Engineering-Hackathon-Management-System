import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";

import type { CurrentGrading } from "../../schemas/judgeDashboard.schema";

type JudgeCurrentGradingCardProps = {
  currentGrading: CurrentGrading;
  totalScorecards: number;
  progressPercent: number;
  onStartGrading: () => void;
};

export const JudgeCurrentGradingCard = ({
  currentGrading,
  totalScorecards,
  progressPercent,
  onStartGrading,
}: JudgeCurrentGradingCardProps) => {
  return (
    <Card
      variant="outlined"
      className="xl:col-span-2 dark:border-slate-700 dark:bg-[#1e293b]"
    >
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <p className="text-sm font-bold uppercase tracking-wide text-gray-400">
                Current Grading
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {currentGrading.eventName} 
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                - {currentGrading.roundName}
              </h2>

              <Chip label={`Track: ${currentGrading.trackName}`} color="secondary" size="small" />
            </div>

          </div>

          <Button
            variant="contained"
            endIcon={<ArrowForwardOutlinedIcon />}
            onClick={onStartGrading}
            sx={{
              bgcolor: "#2563eb",
              textTransform: "none",
              fontWeight: 800,
              "&:hover": {
                bgcolor: "#1d4ed8",
              },
            }}
          >
            Start Grading
          </Button>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="mt-1 font-bold text-gray-900 dark:text-white">
              {currentGrading.pendingSubmissions} submissions
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="mt-1 font-bold text-gray-900 dark:text-white">
              {currentGrading.completedSubmissions} submissions
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
            <p className="text-sm text-gray-500">Deadline</p>
            <p className="mt-1 font-bold text-gray-900 dark:text-white">
              {currentGrading.deadline}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold text-gray-500">
              Grading Progress
            </span>

            <span className="font-bold text-gray-900 dark:text-white">
              {currentGrading.completedSubmissions}/{totalScorecards} scorecards
            </span>
          </div>

          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 8,
              borderRadius: 999,
              bgcolor: "#e5e7eb",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
