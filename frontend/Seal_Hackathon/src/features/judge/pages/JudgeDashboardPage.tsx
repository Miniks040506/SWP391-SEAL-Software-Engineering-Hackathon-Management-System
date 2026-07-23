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
        <Skeleton variant="rounded" height={156} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={132} />
          ))}
        </div>
        <Skeleton variant="rounded" height={320} />
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <JudgeWelcomeBanner
        judgeName={dashboard.judgeName}
        onStartGrading={goToScoring}
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
          onStartGrading={goToScoring}
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
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
