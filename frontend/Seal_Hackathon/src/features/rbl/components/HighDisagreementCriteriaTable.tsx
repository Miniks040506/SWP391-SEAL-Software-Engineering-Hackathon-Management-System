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
  Chip,
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
    const stdDevA = a.standardDeviation;
    const stdDevB = b.standardDeviation;
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
                <TableCell>Classification</TableCell>
                <TableCell align="right">Mean</TableCell>
                <TableCell align="right">Std Dev</TableCell>
                <TableCell align="right">Variance</TableCell>
                <TableCell align="right">Judge Count</TableCell>
                <TableCell align="center">Risk</TableCell>
                <TableCell align="center">Review</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row) => {
                const stdDev = row.standardDeviation;
                return (
                  <TableRow key={row.eventCriteriaId}>
                    <TableCell>{row.criteriaName}</TableCell>
                    <TableCell>{row.category ?? "Uncategorized"}</TableCell>
                    <TableCell>
                      {row.technical ? "Technical" : "Soft"}
                    </TableCell>
                    <TableCell align="right">{row.meanScore.toFixed(2)}</TableCell>
                    <TableCell align="right">{stdDev.toFixed(2)}</TableCell>
                    <TableCell align="right">{row.variance.toFixed(2)}</TableCell>
                    <TableCell align="right">{row.judgeCount}</TableCell>
                    <TableCell align="center">
                      <VarianceRiskBadge standardDeviation={stdDev} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={row.highVariance ? "Review required" : "Within threshold"}
                        color={row.highVariance ? "error" : "default"}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {sortedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
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
