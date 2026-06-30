import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { CriteriaVarianceResponse } from "@/types/system.types";
import { VarianceRiskBadge } from "./VarianceRiskBadge";

type HighDisagreementCriteriaTableProps = {
  data: CriteriaVarianceResponse[];
};

export function HighDisagreementCriteriaTable({
  data,
}: HighDisagreementCriteriaTableProps) {
  const sortedData = [...data].sort((a, b) => {
    const stdDevA = Math.sqrt(a.variance);
    const stdDevB = Math.sqrt(b.variance);
    return stdDevB - stdDevA;
  });

  return (
    <Card sx={{ boxShadow: 1, mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Criteria with High Disagreement
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Criterion</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Mean</TableCell>
                <TableCell align="right">Std Dev</TableCell>
                <TableCell align="right">Variance</TableCell>
                <TableCell align="right">Score Count</TableCell>
                <TableCell align="center">Risk</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row) => {
                const stdDev = Math.sqrt(row.variance);
                return (
                  <TableRow key={row.eventCriteriaId}>
                    <TableCell>{row.criteriaName}</TableCell>
                    <TableCell>
                      {row.technical ? "Technical" : "Soft"}
                    </TableCell>
                    <TableCell align="right">{row.meanScore.toFixed(2)}</TableCell>
                    <TableCell align="right">{stdDev.toFixed(2)}</TableCell>
                    <TableCell align="right">{row.variance.toFixed(2)}</TableCell>
                    {/* Note: Judge count is missing from CriteriaVarianceResponse. Using scoreCount instead as requested. */}
                    <TableCell align="right">{row.scoreCount}</TableCell>
                    <TableCell align="center">
                      <VarianceRiskBadge standardDeviation={stdDev} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {sortedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No criteria data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
