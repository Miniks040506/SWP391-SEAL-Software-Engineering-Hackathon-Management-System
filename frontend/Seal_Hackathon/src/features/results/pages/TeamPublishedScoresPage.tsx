import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { teamApi } from "@/api/team.api";
import { JudgeAnonymityNotice } from "../components/JudgeAnonymityNotice";

const formatPublishedAt = (value?: string | null) => {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export const TeamPublishedScoresPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const { data: scores = [], isLoading, isError, error } = useQuery({
    queryKey: ["teamPublishedScores", teamId],
    queryFn: () => teamApi.getTeamPublishedScores(teamId!),
    enabled: Boolean(teamId),
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
      <Box sx={{ maxWidth: 960, mx: "auto", p: 3 }}>
        <Alert severity="error">
          Failed to load published scores: {(error as Error)?.message || "Unknown error"}
        </Alert>
      </Box>
    );
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 1100, mx: "auto", p: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Published Team Scores
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Official round results and detailed score breakdowns become available here after the coordinator publishes results.
        </Typography>
      </Box>

      <JudgeAnonymityNotice />

      {scores.length === 0 ? (
        <Alert severity="info">
          No published scores are available for this team yet.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {scores.map((score) => (
            <Card key={`${score.teamId}-${score.roundId}`} variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between" }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {score.roundName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {score.eventName} • {score.trackName}
                      </Typography>
                    </Box>
                    <Chip
                      label={score.advanced ? "Advanced" : "Not advanced"}
                      color={score.advanced ? "success" : "default"}
                      size="small"
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ flexWrap: "wrap" }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total score
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {score.totalScore}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Rank
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        #{score.rankPosition}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Judges
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {score.judgeCount}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 220 }}>
                      <Typography variant="caption" color="text.secondary">
                        Published
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formatPublishedAt(score.publishedAt)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/participant/teams/${teamId}/rounds/${score.roundId}/scores`)}
                      sx={{ borderRadius: "10px", fontWeight: 800, textTransform: "none" }}
                    >
                      View score details
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
