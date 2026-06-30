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
import type { JudgeVarianceResponse } from "@/types/system.types";

type JudgeVarianceChartProps = {
  data: JudgeVarianceResponse[];
};

export function JudgeVarianceChart({ data }: JudgeVarianceChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    name: item.judgeType ? `${item.judgeId.substring(0, 8)} (${item.judgeType})` : item.judgeId.substring(0, 8),
    stdDev: Math.sqrt(item.variance),
  }));

  return (
    <Card sx={{ boxShadow: 1, mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Judge Standard Deviation
        </Typography>
        <Box sx={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "stdDev") return [value.toFixed(2), "Std Dev"];
                  if (name === "meanScore") return [value.toFixed(2), "Mean Score"];
                  if (name === "variance") return [value.toFixed(2), "Variance"];
                  if (name === "scoreCount") return [value, "Score Count"];
                  return [value, name];
                }}
              />
              <Bar dataKey="stdDev" fill="#f50057" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
