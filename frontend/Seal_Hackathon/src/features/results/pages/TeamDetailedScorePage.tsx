import { Box, Typography, Stack, Paper, CircularProgress, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { teamApi } from "@/api/team.api";
import { JudgeAnonymityNotice } from "../components/JudgeAnonymityNotice";
import { TeamScoreSummaryCard } from "../components/TeamScoreSummaryCard";
import { CriterionScoreBreakdownTable } from "../components/CriterionScoreBreakdownTable";

export const TeamDetailedScorePage = () => {
  const { teamId, roundId } = useParams<{ teamId: string; roundId: string }>();

  const { data: scoreData, isLoading, isError, error } = useQuery({
    queryKey: ["teamPublishedScore", teamId, roundId],
    queryFn: () => teamApi.getTeamPublishedRoundScore(teamId!, roundId!),
    enabled: Boolean(teamId && roundId),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Failed to load score data: {(error as Error)?.message || "Unknown error"}
        </Alert>
      </Box>
    );
  }

  if (!scoreData) {
    return null;
  }

  if (!scoreData.publishedAt) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="body1">
          Scores are hidden until results are published.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={4} sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      {/* 1. Header Block */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          {scoreData.teamName}
        </Typography>
        <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap", rowGap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Event:</strong> {scoreData.eventName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Round:</strong> {scoreData.roundName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Track:</strong> {scoreData.trackName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Rank:</strong> #{scoreData.rankPosition}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Total Score:</strong> {scoreData.totalScore}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Judges:</strong> {scoreData.judgeCount}
          </Typography>
        </Stack>
      </Paper>

      {/* 2. JudgeAnonymityNotice */}
      <JudgeAnonymityNotice />

      {/* 3. TeamScoreSummaryCard */}
      <TeamScoreSummaryCard
        totalScore={scoreData.totalScore}
        rankPosition={scoreData.rankPosition}
        trackName={scoreData.trackName}
        roundName={scoreData.roundName}
        advanced={scoreData.advanced}
      />

      {/* 4. CriterionScoreBreakdownTable */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Criteria Score Breakdown
        </Typography>
        <CriterionScoreBreakdownTable criteria={scoreData.criteriaScores} />
      </Box>
    </Stack>
  );
};
