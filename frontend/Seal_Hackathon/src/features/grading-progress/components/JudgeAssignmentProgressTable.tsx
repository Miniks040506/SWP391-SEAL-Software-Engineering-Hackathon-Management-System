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
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { JudgeAssignmentProgressResponse } from "@/types/grading.types";
import {
    formatProgressPercent,
    normalizeProgressPercent,
} from "../utils/gradingProgressFormat";

interface JudgeAssignmentProgressTableProps {
    assignments: JudgeAssignmentProgressResponse[];
}

export const JudgeAssignmentProgressTable = ({ assignments = [] }: JudgeAssignmentProgressTableProps) => {
    return (
        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: "16px" }}>
            <Table size="small">
                <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Judge</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Track</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Completed</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Progress</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Pending</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Draft</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Locked</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {assignments.map((assignment) => (
                        <TableRow key={assignment.assignmentId} hover>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {assignment.judgeName || "Unknown Judge"}
                                    </span>
                                    <span className="text-xs text-slate-500">{assignment.judgeEmail}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {assignment.judgeType || "JUDGE"}
                                </span>
                            </TableCell>
                            <TableCell>{assignment.trackName || "-"}</TableCell>
                            <TableCell>
                                <span className="font-bold">{assignment.completedAssignedSubmissions}</span> / {assignment.totalAssignedSubmissions}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <LinearProgress
                                        variant="determinate"
                                        value={normalizeProgressPercent(assignment.percent)}
                                        sx={{ width: 60, height: 6, borderRadius: 3 }}
                                    />
                                    <span className="text-xs font-bold">{formatProgressPercent(assignment.percent)}%</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="font-semibold text-slate-600">{assignment.pendingSubmissions}</span>
                            </TableCell>
                            <TableCell>
                                <span className="font-semibold text-blue-600">{assignment.draftSavedSubmissions}</span>
                            </TableCell>
                            <TableCell>
                                <span className="font-semibold text-emerald-600">{assignment.submittedSubmissions}</span>
                            </TableCell>
                            <TableCell>
                                <span className="font-semibold text-purple-600">{assignment.lockedSubmissions}</span>
                            </TableCell>
                            <TableCell align="right">
                                <Button
                                    component={Link}
                                    to={`/coordinator/judge-assignments/${assignment.assignmentId}/progress`}
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
                    {assignments.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={10} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                No judges assigned to this round yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
