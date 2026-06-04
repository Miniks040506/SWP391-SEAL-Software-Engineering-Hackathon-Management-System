import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { judgeDashboardMock } from "../mocks/judgeDashboard.mock";

export function useJudgeDashboard() {
  const navigate = useNavigate();

  const dashboard = judgeDashboardMock;

  const goToPath = (path: string) => {
    navigate(path);
  };

  const totalScorecards = useMemo(() => {
    return (
      dashboard.currentGrading.pendingSubmissions +
      dashboard.currentGrading.completedSubmissions
    );
  }, [
    dashboard.currentGrading.pendingSubmissions,
    dashboard.currentGrading.completedSubmissions,
  ]);

  const gradingProgressPercent = useMemo(() => {
    if (totalScorecards === 0) return 0;

    return Math.round(
      (dashboard.currentGrading.completedSubmissions / totalScorecards) * 100,
    );
  }, [dashboard.currentGrading.completedSubmissions, totalScorecards]);

  const goToEvents = () => {
    navigate("/judge/events");
  };

  const goToScoring = () => {
    navigate("/judge/scoring");
  };

  const goToCalibration = () => {
    navigate("/judge/calibration");
  };

  return {
    dashboard,
    totalScorecards,
    gradingProgressPercent,
    goToEvents,
    goToScoring,
    goToCalibration,
    goToPath,
  };
}
