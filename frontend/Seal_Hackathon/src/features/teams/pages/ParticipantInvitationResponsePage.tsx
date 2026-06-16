import { useSearchParams, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";

import {
  useInvitationByTokenQuery,
  useAcceptInvitationByTokenMutation,
  useRejectInvitationByTokenMutation,
} from "../hooks/useParticipantTeams";

type Props = {
  action: "accept" | "reject";
};

export const InvitationResponsePage = ({ action }: Props) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const { data: invWrapper, isLoading, isError } = useInvitationByTokenQuery(token || "");
  const acceptMutation = useAcceptInvitationByTokenMutation();
  const rejectMutation = useRejectInvitationByTokenMutation();

  const invitation = invWrapper?.data || invWrapper;

  const isSuccess = action === "accept" ? acceptMutation.isSuccess : rejectMutation.isSuccess;
  const isMutatingError = action === "accept" ? acceptMutation.isError : rejectMutation.isError;
  const isMutating = action === "accept" ? acceptMutation.isPending : rejectMutation.isPending;

  const handleConfirmAction = () => {
    if (!token) return;
    if (action === "accept") acceptMutation.mutate(token);
    if (action === "reject") rejectMutation.mutate(token);
  };

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 bg-slate-50 dark:bg-[#0f172a]">
        <Card className="w-full max-w-md p-8 text-center rounded-3xl dark:bg-slate-800 dark:border-slate-700">
          <ErrorOutlinedIcon className="text-red-500 text-5xl mb-4" />
          <h2 className="text-xl font-extrabold dark:text-white">Invalid Link</h2>
          <p className="mt-2 text-gray-500">The invitation token is missing.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-4 bg-slate-50 dark:bg-[#0f172a]">
        <CircularProgress />
        <p className="mt-4 font-semibold text-gray-500">Loading invitation details...</p>
      </div>
    );
  }

  if (isError || !invitation || invitation.status !== "PENDING") {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 bg-slate-50 dark:bg-[#0f172a]">
        <Card className="w-full max-w-md p-8 text-center rounded-3xl dark:bg-slate-800 dark:border-slate-700">
          <ErrorOutlinedIcon className="text-red-500 text-5xl mb-4" />
          <h2 className="text-xl font-extrabold dark:text-white">Link Expired or Invalid</h2>
          <p className="mt-2 text-sm text-gray-500">
            This invitation link is no longer valid, has already been processed, or you are not authorized.
          </p>
          <Button
            variant="contained"
            onClick={() => navigate("/participant/teams")}
            className="mt-6"
            sx={{ fontWeight: 800, textTransform: "none", borderRadius: "8px", bgcolor: "#2563eb" }}
          >
            Go to My Teams
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 bg-slate-50 dark:bg-[#0f172a]">
      <Card className="w-full max-w-md p-8 text-center rounded-3xl dark:bg-slate-800 dark:border-slate-700 shadow-lg">
        {isSuccess ? (
          <>
            {action === "accept" ? (
              <CheckCircleOutlinedIcon className="text-green-500 text-6xl mb-4" />
            ) : (
              <CancelOutlinedIcon className="text-gray-400 text-6xl mb-4" />
            )}
            <h2 className="text-2xl font-extrabold dark:text-white mb-2">
              {action === "accept" ? "Welcome to the Team!" : "Invitation Declined"}
            </h2>
            <p className="text-gray-500 dark:text-slate-400">
              You have successfully {action === "accept" ? "joined" : "declined to join"} <strong>{invitation.teamName}</strong>.
            </p>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/participant/teams")}
              className="mt-8"
              sx={{ bgcolor: "#2563eb", fontWeight: 800, textTransform: "none", borderRadius: "10px", py: 1.5, "&:hover": { bgcolor: "#1d4ed8" } }}
            >
              Continue to Dashboard
            </Button>
          </>
        ) : (
          <>
            {action === "accept" ? (
              <CheckCircleOutlinedIcon className="text-blue-500 text-6xl mb-4" />
            ) : (
              <CancelOutlinedIcon className="text-red-500 text-6xl mb-4" />
            )}
            <h2 className="text-2xl font-extrabold dark:text-white mb-2">
              {action === "accept" ? "Accept Invitation?" : "Decline Invitation?"}
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mb-6">
              You are about to {action === "accept" ? "join" : "decline the invitation to"} <strong>{invitation.teamName}</strong>.
            </p>
            
            {isMutatingError && (
              <p className="text-red-500 text-sm font-semibold mb-4">Something went wrong. Please try again.</p>
            )}

            <Button
              variant="contained"
              fullWidth
              disabled={isMutating}
              onClick={handleConfirmAction}
              sx={{ 
                bgcolor: action === "accept" ? "#2563eb" : "#ef4444", 
                fontWeight: 800, textTransform: "none", borderRadius: "10px", py: 1.5,
                "&:hover": { bgcolor: action === "accept" ? "#1d4ed8" : "#dc2626" } 
              }}
            >
              {isMutating ? "Processing..." : `Yes, ${action === "accept" ? "Accept" : "Decline"}`}
            </Button>
            <Button
              variant="text"
              fullWidth
              disabled={isMutating}
              onClick={() => navigate("/participant/teams")}
              sx={{ mt: 2, fontWeight: 700, textTransform: "none", color: "gray" }}
            >
              Cancel
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};