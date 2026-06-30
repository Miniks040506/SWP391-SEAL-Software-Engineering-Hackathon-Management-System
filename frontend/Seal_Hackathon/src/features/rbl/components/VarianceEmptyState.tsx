import { Box, Typography } from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";

export function VarianceEmptyState() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 6,
        textAlign: "center",
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <AssessmentIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
      <Typography variant="h6" color="text.primary" gutterBottom>
        No Data Available
      </Typography>
      <Typography variant="body2" color="text.secondary">
        No confirmed score data is available for the selected filters.
      </Typography>
    </Box>
  );
}
