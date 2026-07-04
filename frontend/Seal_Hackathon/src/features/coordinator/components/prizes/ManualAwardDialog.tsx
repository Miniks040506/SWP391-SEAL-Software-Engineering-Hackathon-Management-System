import { useEffect } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";

import type { PrizeResponse } from "@/types/prize.types";
import type { CoordinatorTeamSummaryResponse } from "@/types/team.types";
import {
  manualAwardSchema,
  type ManualAwardFormInput,
  type ManualAwardFormValues,
} from "../../schemas/prize.schema";

type ManualAwardDialogProps = {
  open: boolean;
  prize: PrizeResponse | null;
  teams: CoordinatorTeamSummaryResponse[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ManualAwardFormValues) => void;
};

export const ManualAwardDialog = ({
  open,
  prize,
  teams,
  isSubmitting,
  onClose,
  onSubmit,
}: ManualAwardDialogProps) => {
  const methods = useForm<
    ManualAwardFormInput,
    unknown,
    ManualAwardFormValues
  >({
    resolver: zodResolver(manualAwardSchema),
    defaultValues: {
      teamId: "",
      reason: "",
      sendNotification: true,
      sendInApp: true,
      sendEmail: true,
    },
    mode: "onSubmit",
  });

  const { handleSubmit, control, reset, watch, formState: { errors } } = methods;
  const sendNotification = watch("sendNotification");

  useEffect(() => {
    if (open) {
      reset({
        teamId: prize?.awardedTeamId || "",
        reason: "",
        sendNotification: true,
        sendInApp: true,
        sendEmail: true,
      });
    }
  }, [open, prize, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>Manual Award</DialogTitle>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <div className="mb-4 rounded-lg bg-blue-50 p-4 border border-blue-100">
              <Typography variant="body2" color="text.secondary">
                You are manually awarding the prize:
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 0.5, color: "primary.main" }}>
                {prize?.title} {prize?.trackName ? `(Track: ${prize.trackName})` : "(Overall)"}
              </Typography>
            </div>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Manual award should only be used when the coordinator needs to adjust the winner after reviewing final results.
            </Typography>

            <div className="space-y-4">
              <Controller
                name="teamId"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Select Team"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={Boolean(errors.teamId)}
                    helperText={errors.teamId?.message}
                    fullWidth
                    required
                    size="small"
                  >
                    <MenuItem value="" disabled>
                      <em>Select a team</em>
                    </MenuItem>
                    {teams.map((team) => (
                      <MenuItem key={team.teamId} value={team.teamId}>
                        {team.teamName} {team.trackName ? `(${team.trackName})` : ""}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <TextField
                label="Reason (Recommended)"
                placeholder="Reason for manual award..."
                error={Boolean(errors.reason)}
                helperText={errors.reason?.message || "A reason is recommended for audit traceability."}
                fullWidth
                multiline
                minRows={3}
                size="small"
                {...methods.register("reason")}
              />

              <div className="rounded-xl border border-gray-200 p-4">
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                  Notifications
                </Typography>

                <Controller
                  name="sendNotification"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox checked={field.value} onChange={field.onChange} />}
                      label="Send Notification"
                    />
                  )}
                />

                {sendNotification && (
                  <div className="ml-6 flex flex-col gap-1 sm:flex-row sm:gap-4">
                    <Controller
                      name="sendInApp"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox size="small" checked={field.value} onChange={field.onChange} />}
                          label={<span className="text-sm">In-app</span>}
                        />
                      )}
                    />
                    <Controller
                      name="sendEmail"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox size="small" checked={field.value} onChange={field.onChange} />}
                          label={<span className="text-sm">Email</span>}
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={onClose} disabled={isSubmitting} variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="contained"
              sx={{ fontWeight: "bold" }}
            >
              {isSubmitting ? "Awarding..." : "Confirm Award"}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
};
