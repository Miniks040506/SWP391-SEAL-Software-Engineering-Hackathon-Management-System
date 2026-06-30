import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import type { PrizeResponse } from "@/types/prize.types";
import { clearAwardSchema, type ClearAwardFormValues } from "../../schemas/prize.schema";

type ClearAwardConfirmDialogProps = {
  open: boolean;
  prize: PrizeResponse | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ClearAwardFormValues) => void;
};

export const ClearAwardConfirmDialog = ({
  open,
  prize,
  isSubmitting,
  onClose,
  onSubmit,
}: ClearAwardConfirmDialogProps) => {
  const methods = useForm<ClearAwardFormValues>({
    resolver: zodResolver(clearAwardSchema),
    defaultValues: {
      reason: "",
    },
    mode: "onSubmit",
  });

  const { handleSubmit, reset, formState: { errors } } = methods;

  useEffect(() => {
    if (open) {
      reset({ reason: "" });
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>Clear Award</DialogTitle>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to clear the award for <strong>{prize?.title}</strong>?
            </Typography>
            <Typography variant="body2" color="error" sx={{ mb: 4, fontWeight: "medium" }}>
              This will remove the awarded team ({prize?.awardedTeamName}) from this prize.
              The action will be recorded in the audit log.
            </Typography>

            <TextField
              label="Reason (Recommended)"
              placeholder="Why is this award being cleared?"
              error={Boolean(errors.reason)}
              helperText={errors.reason?.message}
              fullWidth
              multiline
              minRows={3}
              size="small"
              {...methods.register("reason")}
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={onClose} disabled={isSubmitting} variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="contained"
              color="error"
              sx={{ fontWeight: "bold" }}
            >
              {isSubmitting ? "Clearing..." : "Clear Award"}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
};
