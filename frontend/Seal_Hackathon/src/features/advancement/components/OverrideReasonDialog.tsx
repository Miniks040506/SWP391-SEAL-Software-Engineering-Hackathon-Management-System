import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
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
  newStatus: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function OverrideReasonDialog({
  open,
  teamName,
  currentStatus,
  newStatus,
  onConfirm,
  onClose,
}: OverrideReasonDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OverrideFormData>({
    resolver: zodResolver(overrideSchema),
    defaultValues: { reason: "" },
  });

  const onSubmit = (data: OverrideFormData) => {
    onConfirm(data.reason);
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
          Changing status for <strong>{teamName}</strong> from{" "}
          <strong>{currentStatus}</strong> to <strong>{newStatus}</strong>.
        </Typography>
        <form id="override-form" onSubmit={handleSubmit(onSubmit)}>
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
