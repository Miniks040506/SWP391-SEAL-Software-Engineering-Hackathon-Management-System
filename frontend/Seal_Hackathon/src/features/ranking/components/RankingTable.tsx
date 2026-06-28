import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Tooltip,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Link } from "react-router-dom";
import type { RankingResponse } from "@/types/ranking.types";
import { RankingStatusBadge } from "./RankingStatusBadge";


interface RankingTableProps {
    rankings: RankingResponse[];
}


export const RankingTable = ({ rankings = [] }: RankingTableProps) => {
    return (
        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: "16px" }}>
            <Table size="small">
                <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700, width: "60px" }}>Rank</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Team</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Track</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Round</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Total Score</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Judges</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rankings.map((row) => {
                        let statusType: "ADVANCED" | "NOT_ADVANCED" | "DISQUALIFIED" = "NOT_ADVANCED";
                        if (row.advanced) {
                            statusType = "ADVANCED";
                        }


                        return (
                            <TableRow key={row.id} hover>
                                <TableCell sx={{ fontWeight: 800 }}>#{row.rankPosition}</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{row.teamName}</TableCell>
                                <TableCell>{row.projectTitle || "-"}</TableCell>
                                <TableCell>{row.trackName || "-"}</TableCell>
                                <TableCell>{row.roundName}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 font-bold text-blue-600">
                                        {Number(row.totalScore).toFixed(2)}
                                        <Tooltip title="Weighted average from final judge scores" arrow placement="top">
                                            <InfoOutlinedIcon fontSize="inherit" className="text-slate-400" />
                                        </Tooltip>
                                    </div>
                                </TableCell>
                                <TableCell>{row.judgeCount || 0}</TableCell>
                                <TableCell>
                                    <RankingStatusBadge type={statusType} />
                                    {row.published !== undefined && (
                                        <div className="mt-1">
                                            <RankingStatusBadge type={row.published ? "PUBLISHED" : "UNPUBLISHED"} />
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            component={Link}
                                            to={`/coordinator/submissions/${row.submissionId}`}
                                            size="small"
                                            variant="outlined"
                                            startIcon={<VisibilityOutlinedIcon />}
                                            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
                                        >
                                            Submission
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {rankings.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 6, color: "text.secondary" }}>
                                No rankings available yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
