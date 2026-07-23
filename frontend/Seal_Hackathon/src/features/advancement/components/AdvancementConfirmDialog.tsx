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
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
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
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            backgroundImage: "none",
            boxShadow: "0 24px 80px rgba(15, 23, 42, 0.16)",
          },
        },
      }}
    >
      <DialogTitle sx={{ px: 3, pb: 1.5, pt: 3 }}>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
            <FactCheckOutlinedIcon fontSize="small" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              Final review
            </p>
            <p className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Confirm advancement
            </p>
          </div>
        </div>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 1.5 }}>
        <div className="space-y-5">
          <Typography color="text.secondary">
            This updates team status and next-round eligibility for every listed team.
          </Typography>
          <dl className="grid grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50/70 py-3 dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900/50">
            <div className="px-3">
              <dt className="text-xs font-bold text-slate-400">Advanced</dt>
              <dd className="mt-1 font-mono text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{advancedCount}</dd>
            </div>
            <div className="px-3">
              <dt className="text-xs font-bold text-slate-400">Eliminated</dt>
              <dd className="mt-1 font-mono text-3xl font-extrabold text-rose-600 dark:text-rose-400">{eliminatedCount}</dd>
            </div>
            <div className="px-3">
              <dt className="text-xs font-bold text-slate-400">Overrides</dt>
              <dd className="mt-1 font-mono text-3xl font-extrabold text-amber-600 dark:text-amber-400">{overrideCount}</dd>
            </div>
          </dl>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-200">
            Review the preview table before confirming. This action is recorded and cannot be reversed from this screen.
          </div>
          <FormControlLabel
            control={
              <Checkbox
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                disabled={isPending}
              />
            }
            label="I understand this action will update advancement status for all listed teams."
            sx={{ alignItems: "flex-start", m: 0 }}
          />
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2.5, gap: 1, borderTop: "1px solid", borderColor: "divider" }}>
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
            fontWeight: 800,
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
