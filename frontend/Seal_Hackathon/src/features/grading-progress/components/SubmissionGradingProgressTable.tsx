import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { GradingStatusBadge } from "./GradingStatusBadge";
import type { SubmissionGradingProgressResponse } from "@/types/grading.types";

interface SubmissionGradingProgressTableProps {
    submissions: SubmissionGradingProgressResponse[];
}

export const SubmissionGradingProgressTable = ({ submissions }: SubmissionGradingProgressTableProps) => {
    return (
        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: "16px" }}>
            <Table size="small">
                <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Team</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Track</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Sub Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Grading Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Draft Scores</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Confirmed</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Criteria</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Completed</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {submissions.map((sub) => (
                        <TableRow key={sub.submissionId} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{sub.teamName || "Unknown Team"}</TableCell>
                            <TableCell>{sub.trackName || "-"}</TableCell>
                            <TableCell>
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {sub.submissionStatus || "N/A"}
                                </span>
                            </TableCell>
                            <TableCell>
                                <GradingStatusBadge status={sub.gradingStatus} />
                            </TableCell>
                            <TableCell>{sub.draftScoreCount}</TableCell>
                            <TableCell>
                                <span className="font-semibold text-emerald-600">{sub.confirmedScoreCount}</span>
                            </TableCell>
                            <TableCell>{sub.criteriaCount}</TableCell>
                            <TableCell>
                                {sub.completed ? (
                                    <CheckCircleIcon color="success" fontSize="small" />
                                ) : (
                                    <CancelIcon color="disabled" fontSize="small" />
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                    {submissions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                No submissions assigned.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};