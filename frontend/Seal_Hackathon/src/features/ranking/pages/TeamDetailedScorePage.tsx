import { Box, Typography, Stack, Paper } from "@mui/material";
import { useParams } from "react-router-dom";
import { JudgeAnonymityNotice } from "../components/JudgeAnonymityNotice";
import { ScoreSummaryCard } from "../components/ScoreSummaryCard";
import { CriterionScoreBreakdownTable } from "../components/CriterionScoreBreakdownTable";

export const TeamDetailedScorePage = () => {
  const { teamId: _teamId, roundId: _roundId } = useParams<{ teamId: string; roundId: string }>();

  // Placeholder for published state check
  const isPublished = true;

  if (!isPublished) {
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
          —
        </Typography>
        <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap", rowGap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Event:</strong> —
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Round:</strong> —
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Track:</strong> —
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Rank:</strong> —
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Total Score:</strong> —
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Judges:</strong> —
          </Typography>
        </Stack>
      </Paper>

      {/* 2. JudgeAnonymityNotice */}
      <JudgeAnonymityNotice />

      {/* 3. ScoreSummaryCard */}
      <ScoreSummaryCard
        totalScore={0}
        rankPosition={0}
        trackName="—"
        roundName="—"
        advanced={false}
      />

      {/* 4. CriterionScoreBreakdownTable */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Criteria Score Breakdown
        </Typography>
        <CriterionScoreBreakdownTable criteria={[]} />
      </Box>
    </Stack>
  );
};
