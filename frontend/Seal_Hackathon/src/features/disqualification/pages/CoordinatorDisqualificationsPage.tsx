import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { DisqualificationStatusBadge } from "../components/DisqualificationStatusBadge";
import { OverturnDisqualificationDialog } from "../components/OverturnDisqualificationDialog";
import { DisqualifySubmissionDialog } from "../components/DisqualifySubmissionDialog";
import {
  useEventDisqualificationsQuery,
  useOverturnDisqualificationMutation,
  useDisqualifySubmissionMutation,
} from "../hooks/useDisqualificationQueries";
import { SubmissionDetailDrawer } from "@/features/submissions/components/SubmissionDetailDrawer";
import type {
  DisqualifyFormValues,
  OverturnFormValues,
} from "../schemas/disqualification.schema";
import type { DisqualificationResponse } from "@/types/disqualification.types";
import {
  useCoordinatorEventRoundsQuery,
  useCoordinatorEventTracksQuery,
} from "../../coordinator/hooks/useCoordinatorEventQueries";

export function CoordinatorDisqualificationsPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const [roundId, setRoundId] = useState<string>("all");
  const [trackId, setTrackId] = useState<string>("all");
  const [appealStatus, setAppealStatus] = useState<string>("all");

  const [overturnDialogOpen, setOverturnDialogOpen] = useState(false);
  const [selectedDisqualificationId, setSelectedDisqualificationId] = useState<
    string | null
  >(null);

  const [disqualifyDialogOpen, setDisqualifyDialogOpen] = useState(false);
  const [
    selectedSubmissionIdToDisqualify,
    setSelectedSubmissionIdToDisqualify,
  ] = useState<string | null>(null);

  const [viewAppealDialogOpen, setViewAppealDialogOpen] = useState(false);
  const [selectedAppealDisqualification, setSelectedAppealDisqualification] = useState<DisqualificationResponse | null>(null);

  const [drawerDisqualification, setDrawerDisqualification] = useState<DisqualificationResponse | null>(null);

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
  const disqualifyMutation = useDisqualifySubmissionMutation();

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
    
    refetch();
    return res;
  };

  const handleOpenDisqualify = (submissionId: string) => {
    setSelectedSubmissionIdToDisqualify(submissionId);
    setDisqualifyDialogOpen(true);
  };

  const handleCloseDisqualify = () => {
    setDisqualifyDialogOpen(false);
    setSelectedSubmissionIdToDisqualify(null);
  };

  const handleConfirmDisqualify = async (values: DisqualifyFormValues) => {
    if (!selectedSubmissionIdToDisqualify) return;
    const res = await disqualifyMutation.mutateAsync({
      submissionId: selectedSubmissionIdToDisqualify,
      payload: values,
    });
    refetch();
    return res;
  };

  const handleOpenViewAppeal = (disqualification: DisqualificationResponse) => {
    setSelectedAppealDisqualification(disqualification);
    setViewAppealDialogOpen(true);
  };

  const handleCloseViewAppeal = () => {
    setViewAppealDialogOpen(false);
    setSelectedAppealDisqualification(null);
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
            {rounds.map((r: { id: string; name: string }) => (
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
            {tracks.map((t: { id: string; name: string }) => (
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
              <th className="px-4 py-3 font-semibold">Submission</th>
              <th className="px-4 py-3 font-semibold">Round</th>
              <th className="px-4 py-3 font-semibold">Track</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 font-semibold">Evidence</th>
              <th className="px-4 py-3 font-semibold">Appeal status</th>
              <th className="px-4 py-3 font-semibold">Submission status</th>
              <th className="px-4 py-3 font-semibold">Team status</th>
              <th className="px-4 py-3 font-semibold">Issued by</th>
              <th className="px-4 py-3 font-semibold">Issued at</th>
              <th className="px-4 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {disqualifications.length > 0 ? (
              disqualifications.map((d: DisqualificationResponse) => (
                <tr
                  key={d.id}
                  className={[
                    "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    d.appealStatus === "PENDING"
                      ? "border-l-4 border-l-amber-400 bg-amber-50/50 dark:bg-amber-500/5"
                      : "",
                  ].join(" ")}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
                      {d.appealStatus === "PENDING" && (
                        <span className="text-amber-500 text-base leading-none" title="Appeal pending review">⚠</span>
                      )}
                      {d.teamName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-mono text-slate-500">
                      {d.submissionId.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {d.roundName}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {d.trackName || "No track"}
                  </td>
                  <td className="px-4 py-3 max-w-[150px]">
                    <div className="truncate" title={d.reason}>
                      {d.reason}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {d.evidenceUrl ? (
                      <a
                        href={d.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Link
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <DisqualificationStatusBadge
                      appealStatus={
                        d.appealStatus as
                          | "PENDING"
                          | "UPHELD"
                          | "OVERTURNED"
                          | undefined
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      {d.submissionStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      {d.teamStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                    {d.issuedByName || "System"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                    {new Date(d.issuedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2 whitespace-nowrap">
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: "none" }}
                      onClick={() => setDrawerDisqualification(d)}
                    >
                      View details
                    </Button>
                    {d.appealNote && (
                      <Button
                        size="small"
                        variant="contained"
                        color="info"
                        sx={{ textTransform: "none" }}
                        onClick={() => handleOpenViewAppeal(d)}
                      >
                        View Appeal
                      </Button>
                    )}

                    {d.submissionStatus !== "DISQUALIFIED" && (
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        sx={{ textTransform: "none" }}
                        onClick={() => handleOpenDisqualify(d.submissionId)}
                      >
                        Disqualify
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={12}
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

      {selectedSubmissionIdToDisqualify && (
        <DisqualifySubmissionDialog
          open={disqualifyDialogOpen}
          onClose={handleCloseDisqualify}
          submissionId={selectedSubmissionIdToDisqualify}
          isPending={disqualifyMutation.isPending}
          onConfirm={handleConfirmDisqualify}
        />
      )}

      {selectedAppealDisqualification && (
        <Dialog
          open={viewAppealDialogOpen}
          onClose={handleCloseViewAppeal}
          maxWidth="sm"
          fullWidth
          classes={{ paper: "bg-white dark:bg-slate-800 dark:text-slate-200" }}
        >
          <DialogTitle className="font-bold text-slate-800 dark:text-slate-100">
            View Appeal
          </DialogTitle>
          <DialogContent className="space-y-4">
            <div>
              <Typography variant="subtitle2" className="text-slate-500 uppercase mb-1">
                Team
              </Typography>
              <Typography className="text-slate-800 dark:text-slate-200">
                {selectedAppealDisqualification.teamName}
              </Typography>
            </div>
            <div>
              <Typography variant="subtitle2" className="text-slate-500 uppercase mb-1">
                Disqualification Reason
              </Typography>
              <Typography className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {selectedAppealDisqualification.reason}
              </Typography>
            </div>
            <div className="bg-blue-50 dark:bg-slate-900 p-4 rounded-lg border border-blue-100 dark:border-slate-700 mt-4">
              <Typography variant="subtitle2" className="text-blue-800 dark:text-blue-300 font-bold mb-2">
                Appeal Note
              </Typography>
              <Typography className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                {selectedAppealDisqualification.appealNote}
              </Typography>
            </div>
          </DialogContent>
          <DialogActions className="px-6 pb-4">
            <Button onClick={handleCloseViewAppeal} sx={{ textTransform: "none" }}>
              Close
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={() => {
                handleCloseViewAppeal();
                handleOpenOverturn(selectedAppealDisqualification.id);
              }}
              disabled={selectedAppealDisqualification.appealStatus === "OVERTURNED"}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Overturn Disqualification
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {drawerDisqualification && (
        <SubmissionDetailDrawer
          submissionId={drawerDisqualification.submissionId}
          onClose={() => setDrawerDisqualification(null)}
          onRefresh={refetch}
          overturnDisqualificationId={drawerDisqualification.id}
          disableOverturn={drawerDisqualification.appealStatus === "OVERTURNED"}
        />
      )}
    </div>
  );
}
