import { Card, CardContent, Typography, Box } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CriteriaVarianceResponse } from "@/types/system.types";

type CriteriaVarianceChartProps = {
  data: CriteriaVarianceResponse[];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box sx={{ bgcolor: "background.paper", p: 1.5, border: "1px solid #ccc", borderRadius: 1 }}>
        <Typography variant="subtitle2">{label}</Typography>
        <Typography variant="body2">Std Dev: {data.stdDev.toFixed(2)}</Typography>
        <Typography variant="body2">Mean Score: {data.meanScore.toFixed(2)}</Typography>
        <Typography variant="body2">Variance: {data.variance.toFixed(2)}</Typography>
        <Typography variant="body2">Score Count: {data.scoreCount}</Typography>
        <Typography variant="body2">Judge Count: {data.judgeCount}</Typography>
      </Box>
    );
  }
  return null;
};

export function CriteriaVarianceChart({ data }: CriteriaVarianceChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    stdDev: item.standardDeviation,
  }));

  return (
    <Card sx={{ boxShadow: 1, mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Criteria Standard Deviation
        </Typography>
        <Box sx={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="criteriaName"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="stdDev" fill="#3f51b5" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
