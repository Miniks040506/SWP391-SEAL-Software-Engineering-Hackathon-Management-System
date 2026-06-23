import { useState } from "react";
import Button from "@mui/material/Button";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CircleIcon from "@mui/icons-material/Circle";
import { FinalSubmitConfirmDialog } from "./FinalSubmitConfirmDialog";

type Props = {
  isDirty: boolean;
  isLocked: boolean;
  isFinalSubmitted: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  allCriteriaScored: boolean;
  lastSavedAt: Date | null;
  onSaveDraft: () => void;
  onFinalSubmit: () => void;
};

export const ScoreDraftBar = ({
  isDirty,
  isLocked,
  isFinalSubmitted,
  isSaving,
  isSubmitting,
  allCriteriaScored,
  lastSavedAt,
  onSaveDraft,
  onFinalSubmit,
}: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const disabledDraft = !isDirty || isLocked || isFinalSubmitted || isSaving;
  const disabledSubmit = !allCriteriaScored || isLocked || isFinalSubmitted || isSubmitting;

  return (
    <div className="flex flex-col gap-4">
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
