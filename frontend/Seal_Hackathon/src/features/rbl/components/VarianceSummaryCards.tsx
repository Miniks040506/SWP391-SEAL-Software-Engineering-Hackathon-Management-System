import { Card, CardContent, Typography, Box } from "@mui/material";

type VarianceSummaryCardsProps = {
  scoreCount: number;
  judgeCount: number;
  criteriaCount: number;
  overallMean?: number | null;
  overallStandardDeviation?: number | null;
};

function SummaryCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card sx={{ flex: 1, minWidth: 200, boxShadow: 1 }}>
      <CardContent>
        <Typography color="text.secondary" variant="body2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function VarianceSummaryCards({
  scoreCount,
  judgeCount,
  criteriaCount,
  overallMean,
  overallStandardDeviation,
}: VarianceSummaryCardsProps) {
  return (
    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 4 }}>
      <SummaryCard title="Confirmed Scores" value={scoreCount} />
      <SummaryCard title="Judges" value={judgeCount} />
      <SummaryCard title="Criteria" value={criteriaCount} />
      <SummaryCard title="Overall Mean" value={overallMean != null ? overallMean.toFixed(2) : "-"} />
      <SummaryCard
        title="Overall Std Dev"
        value={overallStandardDeviation != null ? overallStandardDeviation.toFixed(2) : "-"}
      />
    </Box>
  );
}
