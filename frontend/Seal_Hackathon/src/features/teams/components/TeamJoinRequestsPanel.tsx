import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

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

  const reject = (requestId: UUID) => {
    const reason = window.prompt("Optional reason for rejecting this request:") ?? undefined;
    rejectMutation.mutate({ requestId, reason: reason?.trim() || undefined });
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
                    onClick={() => reject(request.id)}
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
    </section>
  );
}
