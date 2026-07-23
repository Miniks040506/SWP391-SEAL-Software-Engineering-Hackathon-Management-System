import "../styles/judge.css";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

import { JudgeActionActivitySection } from "../components/dashboard/JudgeActionActivitySection";
import { JudgeCalibrationCard } from "../components/dashboard/JudgeCalibrationCard";
import { JudgeCurrentGradingCard } from "../components/dashboard/JudgeCurrentGradingCard";
import { JudgeSummaryCards } from "../components/dashboard/JudgeSummaryCards";
import { JudgeWelcomeBanner } from "../components/dashboard/JudgeWelcomeBanner";

import { useJudgeDashboard } from "../hooks/useJudgeDashboard";

export const JudgeDashboardPage = () => {
  const {
    dashboard,
    isLoading,
    isError,
    retry,
    totalScorecards,
    gradingProgressPercent,
    goToScoring,
    goToCalibration,
    goToPath,
  } = useJudgeDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="jd-shimmer h-40 rounded-3xl bg-slate-100 dark:bg-slate-800/60" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="jd-shimmer h-32 rounded-2xl bg-slate-100 dark:bg-slate-800/60"
            />
          ))}
        </div>
        <div className="jd-shimmer h-72 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" action={<Button onClick={retry}>Retry</Button>}>
        Could not load the judge dashboard.
      </Alert>
    );
  }

  const calibrationBlocked =
    dashboard.calibration.required && !dashboard.calibration.completed;

  return (
    <div className="space-y-6">
      <JudgeWelcomeBanner
        judgeName={dashboard.judgeName}
        gradingProgressPercent={gradingProgressPercent}
        totalScorecards={totalScorecards}
        completedScorecards={dashboard.currentGrading.completedSubmissions}
        calibrationBlocked={calibrationBlocked}
        onStartGrading={goToScoring}
        onStartCalibration={goToCalibration}
      />

      <JudgeSummaryCards cards={dashboard.summaryCards} />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <JudgeCurrentGradingCard
          currentGrading={dashboard.currentGrading}
          totalScorecards={totalScorecards}
          progressPercent={gradingProgressPercent}
          onStartGrading={goToScoring}
        />
        <JudgeCalibrationCard
          calibration={dashboard.calibration}
          onStartCalibration={goToCalibration}
        />
      </section>

      <JudgeActionActivitySection
        pendingActions={dashboard.pendingActions}
        recentActivities={dashboard.recentActivities}
        onNavigate={goToPath}
      />
    </div>
  );
};
