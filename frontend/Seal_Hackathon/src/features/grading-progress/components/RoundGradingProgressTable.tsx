import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    LinearProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { RoundGradingProgressResponse } from "@/types/grading.types";

interface RoundGradingProgressTableProps {
    rounds: RoundGradingProgressResponse[];
}

export const RoundGradingProgressTable = ({ rounds = [] }: RoundGradingProgressTableProps) => {
    return (
        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: "16px" }}>
            <Table size="small">
                <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Round</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Submissions</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Grading</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Judges</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Completed</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Progress</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rounds.map((round) => (
                        <TableRow key={round.roundId} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{round.roundName}</TableCell>
                            <TableCell>
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {round.roundStatus}
                                </span>
                            </TableCell>
                            <TableCell>
                                {round.submissionLocked ? (
                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                                        <LockOutlinedIcon fontSize="inherit" /> Locked
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                                        <LockOpenOutlinedIcon fontSize="inherit" /> Open
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>
                                {round.gradingLocked ? (
                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                                        <LockOutlinedIcon fontSize="inherit" /> Locked
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                                        <LockOpenOutlinedIcon fontSize="inherit" /> Open
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>{round.judgeAssignmentCount}</TableCell>
                            <TableCell>
                                <span className="font-bold">{round.completedAssignedSubmissions}</span> / {round.totalAssignedSubmissions}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <LinearProgress
                                        variant="determinate"
                                        value={round.percent}
                                        sx={{ width: 60, height: 6, borderRadius: 3 }}
                                    />
                                    <span className="text-xs font-bold">{round.percent}%</span>
                                </div>
                            </TableCell>
                            <TableCell align="right">
                                <Button
                                    component={Link}
                                    to={`/coordinator/rounds/${round.roundId}/grading-progress`}
                                    size="small"
                                    variant="outlined"
                                    startIcon={<VisibilityOutlinedIcon />}
                                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
                                >
                                    View
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {rounds.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                No grading assignments yet. Assign judges to this round before monitoring grading progress.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};