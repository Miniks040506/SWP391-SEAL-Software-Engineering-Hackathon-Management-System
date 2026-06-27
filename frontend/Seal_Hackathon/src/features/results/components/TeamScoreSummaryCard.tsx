import { Card, CardContent, Typography, Chip, Box } from "@mui/material";
import type { TeamDetailedScoreResponse } from "@/types/ranking.types";

export type TeamScoreSummaryCardProps = Pick<
  TeamDetailedScoreResponse,
  "totalScore" | "rankPosition" | "trackName" | "roundName" | "advanced"
>;

export const TeamScoreSummaryCard = ({
  totalScore,
  rankPosition,
  trackName,
  roundName,
  advanced,
}: TeamScoreSummaryCardProps) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
          <Box sx={{ width: { xs: '45%', sm: 'auto' }, flex: { sm: 1 } }}>
            <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mb: 0.5 }}>
              Total score
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {totalScore}
            </Typography>
          </Box>

          <Box sx={{ width: { xs: '45%', sm: 'auto' }, flex: { sm: 1 } }}>
            <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mb: 0.5 }}>
              Rank
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              #{rankPosition}
            </Typography>
          </Box>

          <Box sx={{ width: { xs: '100%', sm: 'auto' }, flex: { sm: 2 } }}>
            <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mb: 0.5 }}>
              Track
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {trackName}
            </Typography>
          </Box>

          <Box sx={{ width: { xs: '100%', sm: 'auto' }, flex: { sm: 2 } }}>
            <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mb: 0.5 }}>
              Round
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {roundName}
            </Typography>
          </Box>

          <Box sx={{ width: { xs: '100%', sm: 'auto' }, flex: { sm: 1 } }}>
            <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mb: 0.5 }}>
              Status
            </Typography>
            <Chip
              label={advanced ? "Advanced" : "Eliminated"}
              color={advanced ? "success" : "error"}
              size="small"
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
