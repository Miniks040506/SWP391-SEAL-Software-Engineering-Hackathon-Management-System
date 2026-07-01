import { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

import { useVarianceDashboardQuery } from "../hooks/useVarianceDashboardQueries";
import {
  useCoordinatorEventRoundsQuery,
  useCoordinatorEventTracksQuery,
} from "@/features/coordinator/hooks/useCoordinatorEventQueries";

import { VarianceFilterBar } from "../components/VarianceFilterBar";
import { VarianceSummaryCards } from "../components/VarianceSummaryCards";
import { CriteriaVarianceChart } from "../components/CriteriaVarianceChart";
import { JudgeVarianceChart } from "../components/JudgeVarianceChart";
import { HighDisagreementCriteriaTable } from "../components/HighDisagreementCriteriaTable";
import { VarianceEmptyState } from "../components/VarianceEmptyState";

import type { GetVarianceDashboardParams } from "@/types/event.types";

export function ScoreVarianceDashboardPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const [selectedRoundId, setSelectedRoundId] = useState("All");
  const [selectedTrackId, setSelectedTrackId] = useState("All");
  const [selectedCriteriaType, setSelectedCriteriaType] = useState("All");
  const [selectedJudgeType, setSelectedJudgeType] = useState("All");

  const { data: rounds = [], isLoading: roundsLoading, isError: roundsError } = useCoordinatorEventRoundsQuery(eventId);
  const { data: tracks = [], isLoading: tracksLoading, isError: tracksError } = useCoordinatorEventTracksQuery(eventId);

  const queryParams: GetVarianceDashboardParams = {};
  if (selectedRoundId !== "All") queryParams.roundId = selectedRoundId;
  if (selectedTrackId !== "All") queryParams.trackId = selectedTrackId;
  if (selectedCriteriaType !== "All") queryParams.criteriaType = selectedCriteriaType.toUpperCase();
  if (selectedJudgeType !== "All") queryParams.judgeType = selectedJudgeType.toUpperCase();

  const {
    data: varianceRes,
    isLoading,
    isError,
    refetch,
  } = useVarianceDashboardQuery(eventId!, queryParams);

  const dashboardData = varianceRes;

  const handleRoundChange = (e: SelectChangeEvent) => setSelectedRoundId(e.target.value);
  const handleTrackChange = (e: SelectChangeEvent) => setSelectedTrackId(e.target.value);
  const handleCriteriaTypeChange = (e: SelectChangeEvent) => setSelectedCriteriaType(e.target.value);
  const handleJudgeTypeChange = (e: SelectChangeEvent) => setSelectedJudgeType(e.target.value);

  if (!eventId) {
    return <Alert severity="error">Event ID is missing in URL.</Alert>;
  }

  return (
    <Box sx={{ p: 0 }}>
      <Typography variant="h4" gutterBottom>
        Score Variance Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Review judge disagreement by criterion and judge type.
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
        Round: {roundsError ? "Error" : roundsLoading ? "Loading..." : (rounds.find((r) => r.id === selectedRoundId)?.name ?? "All")} | Track: {tracksError ? "Error" : tracksLoading ? "Loading..." : (tracks.find((t) => t.id === selectedTrackId)?.name ?? "All")}
      </Typography>

      <VarianceFilterBar
        rounds={rounds}
        tracks={tracks}
        selectedRoundId={selectedRoundId}
        selectedTrackId={selectedTrackId}
        selectedCriteriaType={selectedCriteriaType}
        selectedJudgeType={selectedJudgeType}
        onRoundChange={handleRoundChange}
        onTrackChange={handleTrackChange}
        onCriteriaTypeChange={handleCriteriaTypeChange}
        onJudgeTypeChange={handleJudgeTypeChange}
        onRefresh={() => refetch()}
        isLoading={isLoading}
        roundsLoading={roundsLoading}
        roundsError={roundsError}
        tracksLoading={tracksLoading}
        tracksError={tracksError}
      />

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && !isLoading && (
        <Alert severity="error" sx={{ mt: 4 }}>
          Failed to load variance dashboard data. Please try again.
        </Alert>
      )}

      {dashboardData && dashboardData.totalScoreCount === 0 && !isLoading && !isError && (
        <VarianceEmptyState />
      )}

      {dashboardData && dashboardData.totalScoreCount > 0 && !isLoading && !isError && (
        <Box>
          <VarianceSummaryCards
            scoreCount={dashboardData.totalScoreCount}
            judgeCount={dashboardData.totalJudgeCount}
            criteriaCount={dashboardData.totalCriteriaCount}
            averageCriterionVariance={dashboardData.averageCriterionVariance}
            averageJudgeVariance={dashboardData.averageJudgeVariance}
          />
          <CriteriaVarianceChart data={dashboardData.criteriaVariances} />
          <JudgeVarianceChart data={dashboardData.judgeVariances} />
          <HighDisagreementCriteriaTable data={dashboardData.criteriaVariances} />
        </Box>
      )}
    </Box>
  );
}
