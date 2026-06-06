import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

import { ScoringCriteriaFormFields } from "@/features/criteria/components/scoring/ScoringCriteriaFormFields";
import { useScoringCriteriaDialog } from "@/features/criteria/hooks/useScoringCriteriaDialog";
import type { ScoringCriteriaDialogState } from "@/types/criteria.types";

export type { ScoringCriteriaDialogState } from "@/types/criteria.types";

type ScoringCriteriaDialogProps = {
  state: ScoringCriteriaDialogState | null;
  onClose: () => void;
};

export function ScoringCriteriaDialog({
  state,
  onClose,
}: ScoringCriteriaDialogProps) {
  const { values, setValues, isEdit, isPending, handleSubmit } =
    useScoringCriteriaDialog({ state, onClose });

  return (
    <Dialog open={Boolean(state)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 900 }}>
        {isEdit ? "Edit Scoring Criteria" : "Create Scoring Criteria"}
      </DialogTitle>

      <DialogContent dividers>
        <ScoringCriteriaFormFields
          values={values}
          setValues={setValues}
          isEdit={isEdit}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 800 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isPending}
          sx={{ textTransform: "none", fontWeight: 900 }}
        >
          {isPending ? "Saving..." : isEdit ? "Save changes" : "Create criteria"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
