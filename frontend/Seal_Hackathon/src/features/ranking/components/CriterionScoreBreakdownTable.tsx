import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from "@mui/material";
import type { TeamScoreCriterionResponse } from "@/types/ranking.types";

export type CriterionScoreBreakdownTableProps = {
  criteria: (TeamScoreCriterionResponse & { comments?: string | null })[];
};

export const CriterionScoreBreakdownTable = ({ criteria }: CriterionScoreBreakdownTableProps) => {
  const showComments = criteria.some((c) => c.comments && c.comments.trim().length > 0);

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ overflowX: "auto" }}>
      <Table sx={{ minWidth: 650 }} aria-label="criterion score breakdown table">
        <TableHead sx={{ bgcolor: "background.default" }}>
          <TableRow>
            <TableCell>Criterion</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Weight</TableCell>
            <TableCell align="right">Max score</TableCell>
            <TableCell align="right">Average score</TableCell>
            <TableCell align="right">Weighted score</TableCell>
            <TableCell align="right">Judge count</TableCell>
            {showComments && <TableCell>Comments</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {criteria.map((row) => {
            const weightVal = row.weight ?? 1;
            const weightedScore = (row.averageScore * weightVal).toFixed(2);

            return (
              <TableRow
                key={row.eventCriteriaId}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                    {row.criteriaName}
                  </Typography>
                </TableCell>
                <TableCell>{row.category ?? "—"}</TableCell>
                <TableCell align="right">{row.weight ?? "—"}</TableCell>
                <TableCell align="right">{row.maxScore ?? "—"}</TableCell>
                <TableCell align="right">{row.averageScore}</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  {weightedScore}
                </TableCell>
                <TableCell align="right">{row.judgeCount}</TableCell>
                {showComments && (
                  <TableCell>
                    {row.comments ? (
                      <Typography variant="body2" color="text.secondary">
                        {row.comments}
                      </Typography>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          {criteria.length === 0 && (
            <TableRow>
              <TableCell colSpan={showComments ? 8 : 7} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No criteria scores available.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
