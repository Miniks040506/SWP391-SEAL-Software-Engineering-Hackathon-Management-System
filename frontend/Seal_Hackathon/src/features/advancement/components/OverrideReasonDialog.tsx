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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-300">
        Override Advancement Status
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body1"
          className="mb-4 text-slate-600 dark:text-slate-400"
        >
          Changing status for <strong>{teamName}</strong>. Current status is{" "}
          <strong>{currentStatus}</strong>.
        </Typography>
        <Typography
          variant="body2"
          className="mb-4 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900"
        >
          Manual override will be recorded in the audit log. Please provide a
          clear reason.
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
      </DialogContent>
      <DialogActions className="p-4">
        <Button
          onClick={handleClose}
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
