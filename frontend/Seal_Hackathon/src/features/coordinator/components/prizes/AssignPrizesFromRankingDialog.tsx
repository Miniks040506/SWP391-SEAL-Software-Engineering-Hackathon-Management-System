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

import type { TrackResponse } from "@/types/track.types";
import {
  assignPrizesFromRankingSchema,
  type AssignPrizesFromRankingFormInput,
  type AssignPrizesFromRankingFormValues,
} from "../../schemas/prize.schema";

type AssignPrizesFromRankingDialogProps = {
  open: boolean;
  tracks: TrackResponse[];
  rounds: any[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: AssignPrizesFromRankingFormValues) => void;
};

export const AssignPrizesFromRankingDialog = ({
  open,
  tracks,
  rounds,
  isSubmitting,
  onClose,
  onSubmit,
}: AssignPrizesFromRankingDialogProps) => {
  const methods = useForm<
    AssignPrizesFromRankingFormInput,
    unknown,
    AssignPrizesFromRankingFormValues
  >({
    resolver: zodResolver(assignPrizesFromRankingSchema),
    defaultValues: {
      roundId: "",
      trackId: "",
      overwriteExistingAwards: false,
      sendNotification: true,
      sendInApp: true,
      sendEmail: true,
    },
    mode: "onSubmit",
  });

  const { handleSubmit, control, reset, watch } = methods;
  const sendNotification = watch("sendNotification");

  useEffect(() => {
    if (open) {
      reset({
        roundId: "",
        trackId: "",
        overwriteExistingAwards: false,
        sendNotification: true,
        sendInApp: true,
        sendEmail: true,
      });
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>Auto-Assign Prizes from Ranking</DialogTitle>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Automatically assign configured prizes to teams based on their current ranking.
              You can filter by round or track.
            </Typography>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="roundId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      label="Select Round (Optional)"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      fullWidth
                      size="small"
                    >
                      <MenuItem value="">
                        <em>All Rounds</em>
                      </MenuItem>
                      {rounds.map((round) => (
                        <MenuItem key={round.id} value={round.id}>
                          {round.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="trackId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      label="Select Track (Optional)"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      fullWidth
                      size="small"
                    >
                      <MenuItem value="">
                        <em>All Tracks</em>
                      </MenuItem>
                      {tracks.map((track) => (
                        <MenuItem key={track.id} value={track.id}>
                          {track.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <Controller
                  name="overwriteExistingAwards"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox checked={field.value} onChange={field.onChange} />}
                      label="Overwrite existing awards"
                    />
                  )}
                />
              </div>

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
              {isSubmitting ? "Assigning..." : "Assign Prizes"}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
};
