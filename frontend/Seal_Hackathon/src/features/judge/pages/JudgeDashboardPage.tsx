import { JudgeActionActivitySection } from "../components/dashboard/JudgeActionActivitySection";
import { JudgeCalibrationCard } from "../components/dashboard/JudgeCalibrationCard";
import { JudgeCurrentGradingCard } from "../components/dashboard/JudgeCurrentGradingCard";
import { JudgeSummaryCards } from "../components/dashboard/JudgeSummaryCards";
import { JudgeWelcomeBanner } from "../components/dashboard/JudgeWelcomeBanner";

import { useJudgeDashboard } from "../hooks/useJudgeDashboard";

export const JudgeDashboardPage = () => {
  const {
    dashboard,
    totalScorecards,
    gradingProgressPercent,
    goToEvents,
    goToScoring,
    goToCalibration,
    goToPath,
  } = useJudgeDashboard();

  return (
    <div className="space-y-8">
      <JudgeWelcomeBanner
        judgeName={dashboard.judgeName}
        onStartGrading={goToScoring}
        onViewEvents={goToEvents}
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