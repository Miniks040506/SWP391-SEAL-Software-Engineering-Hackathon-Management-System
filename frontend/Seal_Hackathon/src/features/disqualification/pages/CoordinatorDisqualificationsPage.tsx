import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  useEventDisqualificationsQuery,
  useOverturnDisqualificationMutation,
} from "../hooks/useDisqualificationQueries";
import {
  useCoordinatorEventRoundsQuery,
  useCoordinatorEventTracksQuery,
} from "@/features/coordinator/hooks/useCoordinatorEventQueries";
import { DisqualificationStatusBadge } from "../components/DisqualificationStatusBadge";
import { OverturnDisqualificationDialog } from "../components/OverturnDisqualificationDialog";
import type { OverturnFormValues } from "../schemas/disqualification.schema";
import type { DisqualificationResponse } from "@/types/disqualification.types";

export function CoordinatorDisqualificationsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [roundId, setRoundId] = useState<string>("all");
  const [trackId, setTrackId] = useState<string>("all");
  const [appealStatus, setAppealStatus] = useState<string>("all");

  const [overturnDialogOpen, setOverturnDialogOpen] = useState(false);
  const [selectedDisqualificationId, setSelectedDisqualificationId] = useState<
    string | null
  >(null);

  const { data: rounds = [] } = useCoordinatorEventRoundsQuery(eventId);
  const { data: tracks = [] } = useCoordinatorEventTracksQuery(eventId);

  const {
    data: disqualifications = [],
    isLoading,
    error,
    refetch,
  } = useEventDisqualificationsQuery(eventId, {
    roundId: roundId !== "all" ? roundId : undefined,
    trackId: trackId !== "all" ? trackId : undefined,
    appealStatus: appealStatus !== "all" ? appealStatus : undefined,
  });

  const overturnMutation = useOverturnDisqualificationMutation();

  const handleOpenOverturn = (id: string) => {
    setSelectedDisqualificationId(id);
    setOverturnDialogOpen(true);
  };

  const handleCloseOverturn = () => {
    setOverturnDialogOpen(false);
    setSelectedDisqualificationId(null);
  };

  const handleConfirmOverturn = async (values: OverturnFormValues) => {
    if (!selectedDisqualificationId) return;
    const res = await overturnMutation.mutateAsync({
      disqualificationId: selectedDisqualificationId,
      payload: { reason: values.overturnReason },
    });
    
    // Use notistack to close the default snackbar from the dialog and show this specific one
    closeSnackbar();
    enqueueSnackbar(
      `Disqualification overturned. Ranking recalculated: ${
        res.rankingRecalculated ? "Yes" : "No"
      }.`,
      { variant: "success" },
    );
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert severity="error">Failed to load disqualifications.</Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)] p-6 bg-slate-50 dark:bg-transparent">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-300">
          Disqualifications
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor and manage team disqualifications and appeals.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Round</InputLabel>
          <Select
            value={roundId}
            label="Round"
            onChange={(e) => setRoundId(e.target.value)}
          >
            <MenuItem value="all">All Rounds</MenuItem>
            {rounds.map((r: any) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Track</InputLabel>
          <Select
            value={trackId}
            label="Track"
            onChange={(e) => setTrackId(e.target.value)}
          >
            <MenuItem value="all">All Tracks</MenuItem>
            {tracks.map((t: any) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Appeal Status</InputLabel>
          <Select
            value={appealStatus}
            label="Appeal Status"
            onChange={(e) => setAppealStatus(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="UPHELD">Upheld</MenuItem>
            <MenuItem value="OVERTURNED">Overturned</MenuItem>
          </Select>
        </FormControl>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Team</th>
              <th className="px-4 py-3 font-semibold">Round & Track</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 font-semibold">Appeal Status</th>
              <th className="px-4 py-3 font-semibold">Issued At</th>
              <th className="px-4 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {disqualifications.length > 0 ? (
              disqualifications.map((d: DisqualificationResponse) => (
                <tr
                  key={d.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {d.teamName}
                    </div>
                    <div className="text-xs text-slate-500">
                      Status: {d.teamStatus}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{d.roundName}</div>
                    <div className="text-xs text-slate-500">
                      {d.trackName || "No track"}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="truncate" title={d.reason}>
                      {d.reason}
                    </div>
                    {d.evidenceUrl && (
                      <a
                        href={d.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline block mt-1"
                      >
                        Evidence Link
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <DisqualificationStatusBadge
                      appealStatus={d.appealStatus as "PENDING" | "UPHELD" | "OVERTURNED" | undefined}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                    {new Date(d.issuedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2 whitespace-nowrap">
                    <Link to={`/coordinator/submissions/${d.submissionId}`}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: "none" }}
                      >
                        View details
                      </Button>
                    </Link>
                    <Button
                      size="small"
                      variant="contained"
                      color="warning"
                      sx={{ textTransform: "none" }}
                      disabled={d.appealStatus === "OVERTURNED"}
                      onClick={() => handleOpenOverturn(d.id)}
                    >
                      Overturn
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No disqualifications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedDisqualificationId && (
        <OverturnDisqualificationDialog
          open={overturnDialogOpen}
          onClose={handleCloseOverturn}
          disqualificationId={selectedDisqualificationId}
          isPending={overturnMutation.isPending}
          onConfirm={handleConfirmOverturn}
        />
      )}
    </div>
  );
}
