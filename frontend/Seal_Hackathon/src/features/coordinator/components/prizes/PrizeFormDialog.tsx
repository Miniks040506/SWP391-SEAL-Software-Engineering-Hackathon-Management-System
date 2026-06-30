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
import type { PrizeResponse } from "@/types/prize.types";
import type { TrackResponse } from "@/types/track.types";
import { prizeFormSchema, type PrizeFormValues } from "../../schemas/prize.schema";

type PrizeFormDialogProps = {
  open: boolean;
  tracks: TrackResponse[];
  initialPrize: PrizeResponse | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: PrizeFormValues) => void;
};

export const PrizeFormDialog = ({
  open,
  tracks,
  initialPrize,
  isSubmitting,
  onClose,
  onSubmit,
}: PrizeFormDialogProps) => {
  const isEditMode = Boolean(initialPrize);

  const methods = useForm<PrizeFormValues>({
    resolver: zodResolver(prizeFormSchema),
    defaultValues: {
      trackId: "",
      rankPosition: 1,
      title: "",
      description: "",
      value: null,
      currency: "",
      sponsorName: "",
    },
    mode: "onSubmit",
  });

  const {
    register,
    reset,
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (!open) return;

    if (initialPrize) {
      reset({
        trackId: initialPrize.trackId || "",
        rankPosition: initialPrize.rankPosition || 1,
        title: initialPrize.title || "",
        description: initialPrize.description || "",
        value: initialPrize.value || null,
        currency: initialPrize.currency || "",
        sponsorName: initialPrize.sponsorName || "",
      });
    } else {
      reset({
        trackId: "",
        rankPosition: 1,
        title: "",
        description: "",
        value: null,
        currency: "",
        sponsorName: "",
      });
    }
  }, [open, initialPrize, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {isEditMode ? "Edit Prize" : "Create Prize"}
      </DialogTitle>
      
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Controller
                name="trackId"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Scope (Track / Overall)"
                    value={field.value || ""}
                    onChange={(event) => field.onChange(event.target.value)}
                    error={Boolean(errors.trackId)}
                    helperText={errors.trackId?.message}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="">
                      <em>Overall</em>
                    </MenuItem>
                    {tracks.map((track) => (
                      <MenuItem key={track.id} value={track.id}>
                        {track.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <TextField
                label="Rank Position"
                type="number"
                error={Boolean(errors.rankPosition)}
                helperText={errors.rankPosition?.message}
                fullWidth
                required
                size="small"
                inputProps={{ min: 1 }}
                {...register("rankPosition", { valueAsNumber: true })}
              />

              <TextField
                label="Prize Title"
                placeholder="e.g. First Prize"
                error={Boolean(errors.title)}
                helperText={errors.title?.message}
                fullWidth
                required
                size="small"
                className="md:col-span-2"
                {...register("title")}
              />

              <TextField
                label="Value"
                type="number"
                error={Boolean(errors.value)}
                helperText={errors.value?.message}
                fullWidth
                size="small"
                inputProps={{ min: 0 }}
                {...register("value", { valueAsNumber: true })}
              />

              <TextField
                label="Currency"
                placeholder="e.g. USD, VND"
                error={Boolean(errors.currency)}
                helperText={errors.currency?.message}
                fullWidth
                size="small"
                {...register("currency")}
              />

              <TextField
                label="Sponsor Name"
                placeholder="e.g. Google"
                error={Boolean(errors.sponsorName)}
                helperText={errors.sponsorName?.message}
                fullWidth
                size="small"
                className="md:col-span-2"
                {...register("sponsorName")}
              />

              <TextField
                label="Description"
                placeholder="Additional details..."
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
                fullWidth
                multiline
                minRows={3}
                size="small"
                className="md:col-span-2"
                {...register("description")}
              />
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
              {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Prize"}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
};
