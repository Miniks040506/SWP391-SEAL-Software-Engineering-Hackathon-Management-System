import { format } from "date-fns";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { useNavigate } from "react-router-dom";

import {
  useMyInvitationsQuery,
  useAcceptInvitationMutation,
  useRejectInvitationMutation,
} from "../hooks/useParticipantTeams";

export const MyInvitationsPage = () => {
  const { data: response, isLoading } = useMyInvitationsQuery();
  const acceptMutation = useAcceptInvitationMutation();
  const rejectMutation = useRejectInvitationMutation();
  const navigate = useNavigate();

  const invitations = ((response ?? []) as any[]).filter(
    (inv) => inv.status === "PENDING",
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <Button
        type="button"
        variant="text"
        onClick={() => navigate("/participant/teams")}
        sx={{ textTransform: "none", fontWeight: 800 }}
      >
        ← Back to Teams
      </Button>
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          My Invitations
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Manage pending team invitations sent to your email.
        </p>
      </div>

      {invitations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <DraftsOutlinedIcon className="text-gray-400 text-5xl mb-4" />
          <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">
            No Pending Invitations
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You currently have no invitations to join any team.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invitations.map((inv: any) => (
            <Card
              key={inv.id}
              variant="outlined"
              className="rounded-2xl p-6 dark:border-slate-700 dark:bg-slate-800 flex flex-col justify-between h-full"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">
                  Team Invitation
                </p>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">
                  {inv.teamName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Expires at:{" "}
                  {format(new Date(inv.expiresAt), "MMM dd, yyyy HH:mm")}
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<CancelOutlinedIcon />}
                  disabled={
                    rejectMutation.isPending || acceptMutation.isPending
                  }
                  onClick={() => rejectMutation.mutate(inv.id)}
                  sx={{
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: "8px",
                  }}
                >
                  Decline
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<CheckCircleOutlinedIcon />}
                  disabled={
                    rejectMutation.isPending || acceptMutation.isPending
                  }
                  onClick={() => acceptMutation.mutate(inv.id)}
                  sx={{
                    bgcolor: "#2563eb",
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: "8px",
                    "&:hover": { bgcolor: "#1d4ed8" },
                  }}
                >
                  Accept
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
