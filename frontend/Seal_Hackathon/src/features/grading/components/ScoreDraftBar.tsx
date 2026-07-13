import { useState } from "react";

import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CircleIcon from "@mui/icons-material/Circle";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { FinalSubmitConfirmDialog } from "./FinalSubmitConfirmDialog";

type Props = {
  isDirty: boolean;
  isLocked: boolean;
  isFinalSubmitted: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  allCriteriaScored: boolean;
  lastSavedAt: Date | null;
  gradingStatus?: string;
  onSaveDraft: () => void;
  onFinalSubmit: () => void;
};

const getStatusChipColor = (
  status: string,
): "default" | "warning" | "info" | "success" | "error" => {
  switch (status) {
    case "SUBMITTED":
      return "success";
    case "DRAFT_SAVED":
      return "info";
    case "LOCKED":
      return "error";
    case "PENDING":
    default:
      return "warning";
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case "SUBMITTED":
      return "Final Submitted";
    case "DRAFT_SAVED":
      return "Draft Saved";
    case "LOCKED":
      return "Locked";
    case "PENDING":
      return "Pending";
    default:
      return status;
  }
};

export const ScoreDraftBar = ({
  isDirty,
  isLocked,
  isFinalSubmitted,
  isSaving,
  isSubmitting,
  allCriteriaScored,
  lastSavedAt,
  gradingStatus = "PENDING",
  onSaveDraft,
  onFinalSubmit,
}: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const disabledDraft = !isDirty || isLocked || isFinalSubmitted || isSaving;
  const disabledSubmit = !allCriteriaScored || isLocked || isFinalSubmitted || isSubmitting;

  return (
    <div className="flex flex-col gap-4">
      {/* Status badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Chip
          label={getStatusLabel(gradingStatus)}
          size="small"
          color={getStatusChipColor(gradingStatus)}
          sx={{ fontWeight: 700, borderRadius: "6px" }}
        />
        {isFinalSubmitted && (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
            label="Final Submitted"
            size="small"
            color="success"
            variant="filled"
            sx={{ fontWeight: 700, borderRadius: "6px" }}
          />
        )}
      </div>

      {/* Grading locked banner */}
      {isLocked && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <LockIcon sx={{ fontSize: 16 }} />
          Grading is locked
        </div>
      )}

      {/* Unsaved indicator & timestamp */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isDirty ? (
            <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-500">
              <CircleIcon sx={{ fontSize: 8 }} /> Unsaved changes
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-medium text-gray-500 dark:text-slate-400">
              <CloudDoneIcon fontSize="small" /> Saved
            </span>
          )}
        </div>
        {lastSavedAt && (
          <span className="text-gray-400 dark:text-slate-500">
            {lastSavedAt.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <Button
          variant="outlined"
          onClick={onSaveDraft}
          disabled={disabledDraft}
          fullWidth
          sx={{ fontWeight: 700, borderRadius: "8px", textTransform: "none", py: 1.5 }}
        >
          {isSaving ? "Saving..." : "Save Draft"}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setDialogOpen(true)}
          disabled={disabledSubmit}
          fullWidth
          sx={{ fontWeight: 800, borderRadius: "8px", textTransform: "none", py: 1.5 }}
        >
          Final Submit
        </Button>
      </div>

      <FinalSubmitConfirmDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={() => {
          onFinalSubmit();
          setDialogOpen(false);
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
