import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import RefreshIcon from "@mui/icons-material/Refresh";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ClearIcon from "@mui/icons-material/Clear";

import {
  useCoordinatorEventDetailQuery,
  useCoordinatorEventTracksQuery,
  useCoordinatorEventRoundsQuery,
  useCoordinatorMultipleTeamsQueries
} from "../hooks/useCoordinatorEventQueries";
import { useCoordinatorPrizesQuery } from "../hooks/useCoordinatorPrizeQueries";
import { useCoordinatorPrizeMutations } from "../hooks/useCoordinatorPrizeMutations";

import { AssignPrizesFromRankingDialog } from "../components/prizes/AssignPrizesFromRankingDialog";
import { ManualAwardDialog } from "../components/prizes/ManualAwardDialog";
import { ClearAwardConfirmDialog } from "../components/prizes/ClearAwardConfirmDialog";
import { PrizeScopeBadge } from "../components/prizes/PrizeScopeBadge";
import { PrizeValueDisplay } from "../components/prizes/PrizeValueDisplay";
import { AwardedTeamChip } from "../components/prizes/AwardedTeamChip";

import type { PrizeResponse } from "@/types/prize.types";
import type { AssignPrizesFromRankingFormValues, ManualAwardFormValues, ClearAwardFormValues } from "../schemas/prize.schema";

export const CoordinatorAwardManagementPage = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const { data: event, isLoading: isLoadingEvent } = useCoordinatorEventDetailQuery(eventId);
  const { data: prizes = [], isLoading: isLoadingPrizes, refetch: refetchPrizes, isRefetching } = useCoordinatorPrizesQuery(eventId);
  const { data: tracks = [] } = useCoordinatorEventTracksQuery(eventId);
  const { data: rounds = [] } = useCoordinatorEventRoundsQuery(eventId);

  const teamsQuery = useCoordinatorMultipleTeamsQueries(eventId ? [eventId] : []);
  const teams = teamsQuery[0]?.data?.content || [];

  const { assignFromRanking, manualAward, clearAward } = useCoordinatorPrizeMutations(eventId);

  const totalPrizes = prizes.length;
  const awardedPrizes = prizes.filter((p) => p.awardedTeamId).length;
  const unawardedPrizes = totalPrizes - awardedPrizes;

  const lastAssignedAt = useMemo(() => {
    const awarded = prizes.filter(p => p.awardedAt).map(p => new Date(p.awardedAt!).getTime());
    if (awarded.length === 0) return null;
    return new Date(Math.max(...awarded)).toLocaleString();
  }, [prizes]);

  const [isAutoAssignOpen, setIsAutoAssignOpen] = useState(false);

  const [isManualAwardOpen, setIsManualAwardOpen] = useState(false);
  const [selectedPrizeForAward, setSelectedPrizeForAward] = useState<PrizeResponse | null>(null);

  const [isClearAwardOpen, setIsClearAwardOpen] = useState(false);
  const [selectedPrizeForClear, setSelectedPrizeForClear] = useState<PrizeResponse | null>(null);

  const isLoading = isLoadingEvent || isLoadingPrizes;

  const handleAutoAssignSubmit = (values: AssignPrizesFromRankingFormValues) => {
    assignFromRanking.mutate(values, {
      onSuccess: () => setIsAutoAssignOpen(false),
    });
  };

  const handleManualAwardSubmit = (values: ManualAwardFormValues) => {
    if (!selectedPrizeForAward) return;
    manualAward.mutate(
      { prizeId: selectedPrizeForAward.id, payload: values },
      { onSuccess: () => setIsManualAwardOpen(false) }
    );
  };

  const handleClearAwardSubmit = (values: ClearAwardFormValues) => {
    if (!selectedPrizeForClear) return;
    clearAward.mutate(
      { prizeId: selectedPrizeForClear.id, payload: values },
      { onSuccess: () => setIsClearAwardOpen(false) }
    );
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return <Alert severity="error">Event not found.</Alert>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Award Management</h1>
          <p className="text-sm text-gray-500">
            {event.name} • {event.status}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetchPrizes()}
            disabled={isRefetching}
            sx={{ fontWeight: "bold", bgcolor: "white" }}
          >
            {isRefetching ? "Refreshing..." : "Refresh"}
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AutoFixHighIcon />}
            onClick={() => setIsAutoAssignOpen(true)}
            sx={{ fontWeight: "bold" }}
          >
            Auto Assign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "primary.50", border: "1px solid", borderColor: "primary.100" }}>
          <CardContent sx={{ pb: "16px !important" }}>
            <Typography color="primary.main" variant="subtitle2" fontWeight="bold">
              Total Prizes
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: "primary.dark" }}>
              {totalPrizes}
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "success.50", border: "1px solid", borderColor: "success.100" }}>
          <CardContent sx={{ pb: "16px !important" }}>
            <Typography color="success.main" variant="subtitle2" fontWeight="bold">
              Awarded
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: "success.dark" }}>
              {awardedPrizes}
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "warning.50", border: "1px solid", borderColor: "warning.100" }}>
          <CardContent sx={{ pb: "16px !important" }}>
            <Typography color="warning.main" variant="subtitle2" fontWeight="bold">
              Unawarded
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: "warning.dark" }}>
              {unawardedPrizes}
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: "grey.50", border: "1px solid", borderColor: "grey.200" }}>
          <CardContent sx={{ pb: "16px !important" }}>
            <Typography color="text.secondary" variant="subtitle2" fontWeight="bold">
              Last Assigned At
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 1, color: "text.primary" }}>
              {lastAssignedAt || "-"}
            </Typography>
          </CardContent>
        </Card>
      </div>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="awards table">
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Rank</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Scope</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Prize Title</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Value</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Winner Team</TableCell>
              <TableCell sx={{ fontWeight: "bold", width: 140 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prizes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No prizes configured.
                </TableCell>
              </TableRow>
            ) : (
              prizes.map((prize) => {
                const isAwarded = Boolean(prize.awardedTeamId);
                return (
                  <TableRow key={prize.id} hover>
                    <TableCell>
                      <span className="font-bold text-gray-700">{prize.rankPosition}</span>
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
                      <AwardedTeamChip teamName={prize.awardedTeamName} />
                      {prize.awardedAt && (
                        <div className="text-[11px] text-gray-400 mt-1">
                          {new Date(prize.awardedAt).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <div className="flex justify-center gap-1">
                        <Tooltip title="Manual Award">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => {
                              setSelectedPrizeForAward(prize);
                              setIsManualAwardOpen(true);
                            }}
                          >
                            <EmojiEventsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={isAwarded ? "Clear Award" : "No award to clear"}>
                          <span>
                            <IconButton
                              color="error"
                              size="small"
                              disabled={!isAwarded}
                              onClick={() => {
                                setSelectedPrizeForClear(prize);
                                setIsClearAwardOpen(true);
                              }}
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AssignPrizesFromRankingDialog
        open={isAutoAssignOpen}
        tracks={tracks}
        rounds={rounds}
        isSubmitting={assignFromRanking.isPending}
        onClose={() => setIsAutoAssignOpen(false)}
        onSubmit={handleAutoAssignSubmit}
      />

      <ManualAwardDialog
        open={isManualAwardOpen}
        prize={selectedPrizeForAward}
        teams={teams}
        isSubmitting={manualAward.isPending}
        onClose={() => setIsManualAwardOpen(false)}
        onSubmit={handleManualAwardSubmit}
      />

      <ClearAwardConfirmDialog
        open={isClearAwardOpen}
        prize={selectedPrizeForClear}
        isSubmitting={clearAward.isPending}
        onClose={() => setIsClearAwardOpen(false)}
        onSubmit={handleClearAwardSubmit}
      />
    </div>
  );
};
