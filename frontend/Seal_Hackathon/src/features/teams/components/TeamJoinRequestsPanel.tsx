import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

import type { UUID } from "@/types/common.types";
import {
  useAcceptJoinRequestMutation,
  useRejectJoinRequestMutation,
  useTeamJoinRequestsQuery,
} from "../hooks/useTeamJoinRequests";
import { TeamStatusBadge } from "./TeamStatusBagde";

export function TeamJoinRequestsPanel({ teamId }: { teamId: UUID }) {
  const requestsQuery = useTeamJoinRequestsQuery(teamId);
  const acceptMutation = useAcceptJoinRequestMutation(teamId);
  const rejectMutation = useRejectJoinRequestMutation(teamId);
  const requests = requestsQuery.data ?? [];
  const [rejectRequestId, setRejectRequestId] = useState<UUID | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const openRejectDialog = (requestId: UUID) => {
    setRejectRequestId(requestId);
    setRejectReason("");
  };

  const closeRejectDialog = () => {
    if (rejectMutation.isPending) return;
    setRejectRequestId(null);
    setRejectReason("");
  };

  const confirmReject = () => {
    if (!rejectRequestId) return;
    rejectMutation.mutate(
      {
        requestId: rejectRequestId,
        reason: rejectReason.trim() || undefined,
      },
      { onSuccess: closeRejectDialog },
    );
  };

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Join Requests</h3>
        <p className="mt-1 text-sm text-gray-500">Only the team leader can accept or reject these requests.</p>
      </div>

      {requestsQuery.isLoading && <CircularProgress size={24} />}
      {requestsQuery.isError && <Alert severity="warning">Cannot load join requests right now.</Alert>}
      {!requestsQuery.isLoading && !requestsQuery.isError && requests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <p className="font-bold text-gray-700 dark:text-slate-200">No join requests.</p>
        </div>
      )}

      {requests.map((request) => {
        const pending = request.status === "PENDING";
        const mutating = acceptMutation.isPending || rejectMutation.isPending;
        return (
          <div
            key={request.id}
            className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 md:flex-row md:items-center md:justify-between dark:border-slate-700"
          >
            <div>
              <p className="font-extrabold text-gray-900 dark:text-white">{request.requesterName}</p>
              <p className="mt-1 text-sm text-gray-500">{request.requesterEmail}</p>
              {request.message && (
                <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                  {request.message}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <TeamStatusBadge status={request.status} />
              {pending && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={mutating}
                    onClick={() => openRejectDialog(request.id)}
                    sx={{ fontWeight: 800, textTransform: "none" }}
                  >
                    Reject
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={mutating}
                    onClick={() => acceptMutation.mutate(request.id)}
                    sx={{ fontWeight: 800, textTransform: "none" }}
                  >
                    Accept
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}
      <Dialog
        open={rejectRequestId !== null}
        onClose={rejectMutation.isPending ? undefined : closeRejectDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Reject join request?</DialogTitle>
        <DialogContent dividers className="space-y-4">
          <Alert severity="warning">
            The requester will not be added to this team.
          </Alert>
          <TextField
            label="Reason (optional)"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            disabled={rejectMutation.isPending}
            multiline
            minRows={3}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeRejectDialog} disabled={rejectMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={confirmReject}
            disabled={rejectMutation.isPending}
            color="error"
            variant="contained"
          >
            {rejectMutation.isPending ? "Rejecting..." : "Reject request"}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}
