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
import type { RoundResponse } from "@/types/round.types";
import type { TrackResponse } from "@/types/track.types";

type CriteriaFilter = NonNullable<GetVarianceDashboardParams["criteriaType"]> | "ALL";
type JudgeFilter = NonNullable<GetVarianceDashboardParams["judgeType"]> | "ALL";

export function ScoreVarianceDashboardPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const [selectedRoundId, setSelectedRoundId] = useState("ALL");
  const [selectedTrackId, setSelectedTrackId] = useState("ALL");
  const [selectedCriteriaType, setSelectedCriteriaType] = useState<CriteriaFilter>("ALL");
  const [selectedJudgeType, setSelectedJudgeType] = useState<JudgeFilter>("ALL");

  const roundsQuery = useCoordinatorEventRoundsQuery(eventId);
  const tracksQuery = useCoordinatorEventTracksQuery(eventId);
  const rounds = (roundsQuery.data ?? []) as RoundResponse[];
  const tracks = (tracksQuery.data ?? []) as TrackResponse[];
  const { isLoading: roundsLoading, isError: roundsError } = roundsQuery;
  const { isLoading: tracksLoading, isError: tracksError } = tracksQuery;

  const queryParams: GetVarianceDashboardParams = {};
  if (selectedRoundId !== "ALL") queryParams.roundId = selectedRoundId;
  if (selectedTrackId !== "ALL") queryParams.trackId = selectedTrackId;
  if (selectedCriteriaType !== "ALL") queryParams.criteriaType = selectedCriteriaType;
  if (selectedJudgeType !== "ALL") queryParams.judgeType = selectedJudgeType;

  const {
    data: varianceRes,
    isLoading,
    isError,
    refetch,
  } = useVarianceDashboardQuery(eventId!, queryParams);

  const dashboardData = varianceRes;

  const handleRoundChange = (e: SelectChangeEvent) => setSelectedRoundId(e.target.value);
  const handleTrackChange = (e: SelectChangeEvent) => setSelectedTrackId(e.target.value);
  const handleCriteriaTypeChange = (e: SelectChangeEvent) =>
    setSelectedCriteriaType(e.target.value as CriteriaFilter);
  const handleJudgeTypeChange = (e: SelectChangeEvent) =>
    setSelectedJudgeType(e.target.value as JudgeFilter);

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
      {dashboardData?.eventName && (
        <Typography variant="h6" sx={{ mb: 1 }}>
          {dashboardData.eventName}
        </Typography>
      )}
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
            overallMean={dashboardData.overallMean}
            overallStandardDeviation={dashboardData.overallStandardDeviation}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Review threshold: σ ≥ {dashboardData.varianceThreshold.toFixed(2)} points
          </Typography>
          <CriteriaVarianceChart data={dashboardData.criteriaVariances} />
          <JudgeVarianceChart data={dashboardData.judgeVariances} />
          <HighDisagreementCriteriaTable data={dashboardData.criteriaVariances} />
        </Box>
      )}
    </Box>
  );
}
