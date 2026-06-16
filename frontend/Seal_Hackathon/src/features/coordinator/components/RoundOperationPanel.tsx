import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import type { RoundResponse } from "@/types/round.types";
import { useRoundOperationStatusQuery, useRoundOperationMutations } from "../hooks/useRoundOperation";

function OperationModal({ open, title, content, onConfirm, onCancel, confirmLabel, isPending }: any) {
  return (
    <Dialog open={open} onClose={isPending ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
      <DialogContent>
        <p className="text-sm text-slate-600 dark:text-slate-300">{content}</p>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onCancel} disabled={isPending} sx={{ textTransform: "none", fontWeight: 700 }}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" disabled={isPending} sx={{ textTransform: "none", fontWeight: 700 }}>
          {isPending ? <CircularProgress size={20} color="inherit" /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function RoundOperationPanel({
  rounds,
  onChanged,
}: {
  rounds: RoundResponse[];
  onChanged: () => void | Promise<void>;
}) {
  const sortedRounds = [...rounds].sort((a, b) => a.orderIndex - b.orderIndex);
  
  // Find current round: the first one that is not LOCKED.
  // If all are LOCKED, currentRound is undefined.
  const currentRound = sortedRounds.find((r) => r.status !== "LOCKED");

  const roundId = currentRound?.id;
  const statusQuery = useRoundOperationStatusQuery(roundId);
  const mutations = useRoundOperationMutations(roundId || "");

  const [modalState, setModalState] = useState<{
    open: boolean;
    action: "OPEN" | "CLOSE" | "LOCK" | null;
  }>({ open: false, action: null });

  // Polling auto-trigger
  useEffect(() => {
    if (!statusQuery.data || !currentRound) return;
    const { roundStatus, submissionDeadline } = statusQuery.data;

    if (!submissionDeadline) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const deadline = new Date(submissionDeadline).getTime();

      if (now >= deadline) {
        if (roundStatus === "ONGOING") {
          mutations.closeRound().then(() => {
            onChanged();
          }).catch(() => {});
        } else if (roundStatus === "CLOSED") {
          mutations.lockSubmissions().then(() => {
            onChanged();
          }).catch(() => {});
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [statusQuery.data, currentRound, mutations, onChanged]);

  if (!rounds.length) return null;

  if (!currentRound) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <CheckCircleOutlinedIcon className="text-slate-400" />
        <span className="font-bold text-slate-600 dark:text-slate-300">All Rounds Completed</span>
      </div>
    );
  }

  const { roundStatus, submittedOrLateSubmissionCount, draftSubmissionCount } = statusQuery.data || {};
  const isFetching = statusQuery.isFetching;

  const handleAction = async () => {
    try {
      if (modalState.action === "OPEN") {
        await mutations.openRound();
      } else if (modalState.action === "CLOSE") {
        await mutations.closeRound();
      } else if (modalState.action === "LOCK") {
        await mutations.lockSubmissions();
      }
      setModalState({ open: false, action: null });
      await onChanged();
    } catch {
      // errors are handled in mutations
    }
  };

  const currentRoundName = currentRound.name || `Round ${currentRound.orderIndex}`;

  let buttonLabel = "";
  let action: "OPEN" | "CLOSE" | "LOCK" | null = null;
  let modalTitle = "";
  let modalContent = "";
  let Icon = PlayArrowOutlinedIcon;

  switch (roundStatus ?? currentRound.status) {
    case "NOT_STARTED":
      buttonLabel = `Start ${currentRoundName}`;
      action = "OPEN";
      modalTitle = `Start ${currentRoundName}?`;
      modalContent = `This will open the round for team registrations and submissions. Teams will be able to join.`;
      break;
    case "ONGOING":
      buttonLabel = "Close Round";
      action = "CLOSE";
      modalTitle = `Close ${currentRoundName}?`;
      modalContent = `This will close submissions for ${submittedOrLateSubmissionCount ?? 0} teams. ${draftSubmissionCount ?? 0} submissions are still in draft.`;
      Icon = StopCircleOutlinedIcon;
      break;
    case "CLOSED":
      buttonLabel = "Lock Submissions";
      action = "LOCK";
      modalTitle = `Lock Submissions for ${currentRoundName}?`;
      modalContent = `This will lock all submissions permanently. ${submittedOrLateSubmissionCount ?? 0} submitted, ${draftSubmissionCount ?? 0} in draft.`;
      Icon = LockOutlinedIcon;
      break;
    default:
      break;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 mb-6">
      <div>
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Active Round Control
        </h3>
        <p className="mt-1 text-lg font-black text-slate-900 dark:text-white flex items-center gap-3">
          {currentRoundName}
          {isFetching && <CircularProgress size={16} />}
        </p>
      </div>

      <div>
        {action && (
          <Button
            variant="contained"
            startIcon={<Icon />}
            onClick={() => setModalState({ open: true, action })}
            disabled={statusQuery.isLoading || mutations.isPending}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 900,
              bgcolor: action === "CLOSE" ? "#f59e0b" : action === "LOCK" ? "#ef4444" : "#3b82f6",
              "&:hover": {
                bgcolor: action === "CLOSE" ? "#d97706" : action === "LOCK" ? "#dc2626" : "#2563eb",
              }
            }}
          >
            {buttonLabel}
          </Button>
        )}
      </div>

      <OperationModal
        open={modalState.open}
        title={modalTitle}
        content={modalContent}
        confirmLabel={buttonLabel}
        isPending={mutations.isPending}
        onConfirm={handleAction}
        onCancel={() => setModalState({ open: false, action: null })}
      />
    </div>
  );
}
