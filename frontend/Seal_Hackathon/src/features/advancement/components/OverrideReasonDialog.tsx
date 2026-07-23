import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";

const overrideSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters long."),
});

type OverrideFormData = z.infer<typeof overrideSchema>;

interface OverrideReasonDialogProps {
  open: boolean;
  teamName: string;
  currentStatus: string;
  initialStatus: string;
  onConfirm: (newStatus: string, reason: string) => void;
  onClose: () => void;
}

export function OverrideReasonDialog({
  open,
  teamName,
  currentStatus,
  initialStatus,
  onConfirm,
  onClose,
}: OverrideReasonDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OverrideFormData & { newStatus: string }>({
    resolver: zodResolver(
      overrideSchema.extend({
        newStatus: z.string().min(1, "Please select a final status"),
      })
    ),
    defaultValues: { reason: "", newStatus: initialStatus },
  });

  const onSubmit = (data: OverrideFormData & { newStatus: string }) => {
    onConfirm(data.newStatus, data.reason);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
            <EditNoteOutlinedIcon fontSize="small" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              Manual decision
            </p>
            <p className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Override advancement
            </p>
          </div>
        </div>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 1.5 }}>
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Team</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">{teamName}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Current status: <strong>{currentStatus}</strong>
            </p>
          </div>
          <Typography
            variant="body2"
            className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-amber-800 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-200"
          >
            This decision is recorded in the audit log. Add enough context for another coordinator to review it later.
          </Typography>
          <form id="override-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="newStatus"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Final Status"
                fullWidth
                required
                error={!!errors.newStatus}
                helperText={errors.newStatus?.message as string}
                variant="outlined"
              >
                <MenuItem value="ADVANCED">Advanced</MenuItem>
                <MenuItem value="ELIMINATED">Eliminated</MenuItem>
              </TextField>
            )}
          />
          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Reason for override"
                multiline
                rows={4}
                fullWidth
                required
                error={!!errors.reason}
                helperText={errors.reason?.message}
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
          />
          </form>
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2.5, gap: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          onClick={handleClose}
          color="inherit"
          sx={{
            textTransform: "none",
            fontWeight: 800,
            borderRadius: "10px",
            boxShadow: "none",
            height: 40,
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="override-form"
          variant="contained"
          color="primary"
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "10px",
            boxShadow: "none",
            height: 40,
          }}
        >
          Apply override
        </Button>
      </DialogActions>
    </Dialog>
  );
}
