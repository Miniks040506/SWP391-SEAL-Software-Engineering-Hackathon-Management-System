import { useNavigate, useSearchParams } from "react-router-dom";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";

import {
  useAcceptJoinRequestByTokenMutation,
  useJoinRequestByTokenQuery,
  useRejectJoinRequestByTokenMutation,
} from "../hooks/useTeamJoinRequests";

type Props = {
  action: "accept" | "reject";
};

export function JoinRequestResponsePage({ action }: Props) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const requestQuery = useJoinRequestByTokenQuery(token);
  const acceptMutation = useAcceptJoinRequestByTokenMutation();
  const rejectMutation = useRejectJoinRequestByTokenMutation();
  const activeMutation = action === "accept" ? acceptMutation : rejectMutation;

  const confirm = () => {
    if (!token) return;
    if (action === "accept") acceptMutation.mutate(token);
    else rejectMutation.mutate(token);
  };

  if (!token) {
    return <InvalidRequestLink message="The join request token is missing." />;
  }

  if (requestQuery.isLoading) {
    return (
      <PageShell>
        <CircularProgress />
        <p className="mt-4 font-semibold text-gray-500">Loading request details...</p>
      </PageShell>
    );
  }

  const request = requestQuery.data;
  if (activeMutation.isSuccess && request) {
    return (
      <PageShell>
        <Card className="w-full max-w-md rounded-3xl p-8 text-center dark:bg-slate-800">
          {action === "accept" ? (
            <CheckCircleOutlinedIcon className="mb-4 text-6xl text-green-500" />
          ) : (
            <CancelOutlinedIcon className="mb-4 text-6xl text-gray-400" />
          )}
          <h1 className="text-2xl font-extrabold dark:text-white">
            Request {action === "accept" ? "Accepted" : "Rejected"}
          </h1>
          <p className="mt-2 text-gray-500 dark:text-slate-400">
            {request.requesterName}&apos;s request for <strong>{request.teamName}</strong> has been {action === "accept" ? "accepted" : "rejected"}.
          </p>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate(`/participant/teams/${request.teamId}`)}
            sx={{ mt: 4, py: 1.5, borderRadius: "10px", fontWeight: 800, textTransform: "none" }}
          >
            Open Team
          </Button>
        </Card>
      </PageShell>
    );
  }

  if (requestQuery.isError || !request || request.status !== "PENDING") {
    return <InvalidRequestLink message="This request is invalid, expired, or has already been processed." />;
  }

  return (
    <PageShell>
      <Card className="w-full max-w-md rounded-3xl p-8 text-center shadow-lg dark:bg-slate-800">
        {action === "accept" ? (
          <CheckCircleOutlinedIcon className="mb-4 text-6xl text-blue-500" />
        ) : (
          <CancelOutlinedIcon className="mb-4 text-6xl text-red-500" />
        )}
        <h1 className="text-2xl font-extrabold dark:text-white">
          {action === "accept" ? "Accept Join Request?" : "Reject Join Request?"}
        </h1>
        <p className="mt-3 text-gray-500 dark:text-slate-400">
          <strong>{request.requesterName}</strong> ({request.requesterEmail}) wants to join <strong>{request.teamName}</strong>.
        </p>
        {request.message && (
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
            {request.message}
          </p>
        )}
        {activeMutation.isError && (
          <p className="mt-4 text-sm font-semibold text-red-500">
            The request could not be processed. It may have already changed.
          </p>
        )}
        <Button
          variant="contained"
          fullWidth
          disabled={activeMutation.isPending}
          onClick={confirm}
          sx={{
            mt: 4,
            py: 1.5,
            borderRadius: "10px",
            bgcolor: action === "accept" ? "#2563eb" : "#ef4444",
            fontWeight: 800,
            textTransform: "none",
            "&:hover": { bgcolor: action === "accept" ? "#1d4ed8" : "#dc2626" },
          }}
        >
          {activeMutation.isPending ? "Processing..." : action === "accept" ? "Accept Request" : "Reject Request"}
        </Button>
      </Card>
    </PageShell>
  );
}

function InvalidRequestLink({ message }: { message: string }) {
  return (
    <PageShell>
      <Card className="w-full max-w-md rounded-3xl p-8 text-center dark:bg-slate-800">
        <ErrorOutlinedIcon className="mb-4 text-5xl text-red-500" />
        <h1 className="text-xl font-extrabold dark:text-white">Link Expired or Invalid</h1>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
      </Card>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      {children}
    </main>
  );
}
