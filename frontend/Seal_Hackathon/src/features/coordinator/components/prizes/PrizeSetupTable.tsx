import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { PrizeResponse } from "@/types/prize.types";
import { PrizeScopeBadge } from "./PrizeScopeBadge";
import { PrizeValueDisplay } from "./PrizeValueDisplay";
import { AwardedTeamChip } from "./AwardedTeamChip";

type PrizeSetupTableProps = {
    prizes: PrizeResponse[];
    isLocked: boolean;
    onEdit: (prize: PrizeResponse) => void;
    onDelete: (prize: PrizeResponse) => void;
};

export const PrizeSetupTable = ({
    prizes,
    isLocked,
    onEdit,
    onDelete,
}: PrizeSetupTableProps) => {
    if (!prizes || prizes.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-500">No prizes have been configured yet.</p>
            </div>
        );
    }

    return (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="prize setup table">
                <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Rank</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Scope</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Prize Title</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Value</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Sponsor</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Awarded Team</TableCell>
                        <TableCell sx={{ fontWeight: "bold", width: 100 }} align="center">
                            Actions
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {prizes.map((prize) => {
                        const isAwarded = Boolean(prize.awardedTeamId);

                        return (
                            <TableRow key={prize.id} hover>
                                <TableCell>
                                    <span className="font-bold text-gray-700">
                                        {prize.rankPosition}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <PrizeScopeBadge trackName={prize.trackName} />
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium">{prize.title}</span>
                                </TableCell>
                                <TableCell>
                                    <PrizeValueDisplay value={prize.value} currency={prize.currency} />
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-gray-600">
                                        {prize.sponsorName || "-"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <AwardedTeamChip teamName={prize.awardedTeamName} />
                                </TableCell>
                                <TableCell align="center">
                                    <div className="flex justify-center gap-1">
                                        <Tooltip title={isLocked ? "Event is locked" : "Edit prize"}>
                                            <span>
                                                <IconButton
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => onEdit(prize)}
                                                    disabled={isLocked}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>

                                        <Tooltip
                                            title={
                                                isLocked
                                                    ? "Event is locked"
                                                    : isAwarded
                                                        ? "Clear award before deleting this prize"
                                                        : "Delete prize"
                                            }
                                        >
                                            <span>
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() => onDelete(prize)}
                                                    disabled={isLocked || isAwarded}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
