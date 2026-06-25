import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";

interface AdvancementConfirmDialogProps {
  open: boolean;
  advancedCount: number;
  eliminatedCount: number;
  overrideCount: number;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}

export function AdvancementConfirmDialog({
  open,
  advancedCount,
  eliminatedCount,
  overrideCount,
  onConfirm,
  onClose,
  isPending,
}: AdvancementConfirmDialogProps) {
  const [understood, setUnderstood] = useState(false);

  useEffect(() => {
    if (open) {
      setUnderstood(false);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-300">
        Confirm advancement?
      </DialogTitle>
      <DialogContent>
        <div className="space-y-4 py-2 mt-2">
          <Typography className="text-slate-600 dark:text-slate-400">
            This will update team statuses and determine next-round eligibility.
          </Typography>
          <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
            <li>
              <strong>Advanced Teams:</strong> {advancedCount}
            </li>
            <li>
              <strong>Eliminated Teams:</strong> {eliminatedCount}
            </li>
            {overrideCount > 0 && (
              <li className="text-amber-600 dark:text-amber-400">
                <strong>Manual Overrides:</strong> {overrideCount}
              </li>
            )}
          </ul>
          <FormControlLabel
            control={
              <Checkbox
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                disabled={isPending}
              />
            }
            label="I understand this action will affect next round access."
            className="mt-4"
          />
        </div>
      </DialogContent>
      <DialogActions className="p-4">
        <Button
          onClick={onClose}
          disabled={isPending}
          color="inherit"
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "10px",
            boxShadow: "none",
            height: 40,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          disabled={!understood || isPending}
          startIcon={
            isPending ? <CircularProgress size={20} color="inherit" /> : null
          }
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "10px",
            boxShadow: "none",
            height: 40,
          }}
        >
          Confirm advancement
        </Button>
      </DialogActions>
    </Dialog>
  );
}
