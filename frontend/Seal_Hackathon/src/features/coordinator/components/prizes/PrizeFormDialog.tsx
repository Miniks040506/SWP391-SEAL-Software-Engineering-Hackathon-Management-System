import { useEffect } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import type { PrizeResponse } from "@/types/prize.types";
import type { TrackResponse } from "@/types/track.types";
import {
  prizeFormSchema,
  type PrizeFormInput,
  type PrizeFormValues,
} from "../../schemas/prize.schema";

type PrizeFormDialogProps = {
  open: boolean;
  tracks: TrackResponse[];
  initialPrize: PrizeResponse | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: PrizeFormValues) => void;
};

const DIALOG_PAPER_SX = {
  "& .MuiDialog-paper": {
    borderRadius: "20px",
    overflow: "hidden",
    backgroundImage: "none",
  },
} as const;

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
  },
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

  const methods = useForm<PrizeFormInput, unknown, PrizeFormValues>({
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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={DIALOG_PAPER_SX}
      classes={{ paper: "bg-white dark:bg-slate-900" }}
    >
      {/* Gradient header — shared chrome across edit-event popups */}
      <div className="relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-amber-950 px-6 py-5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-amber-500/25 blur-2xl"
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-400 text-white shadow-md">
            <EmojiEventsOutlinedIcon />
          </span>
          <div>
            <h2 className="text-lg font-black text-white">
              {isEditMode ? "Edit Prize" : "Create Prize"}
            </h2>
            <p className="text-xs font-medium text-slate-400">
              {isEditMode
                ? "Adjust this prize's scope, rank, and value"
                : "Add a prize for the whole event or a specific track"}
            </p>
          </div>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    sx={fieldSx}
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
                sx={fieldSx}
                slotProps={{ htmlInput: { min: 1 } }}
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
                sx={fieldSx}
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
                sx={fieldSx}
                slotProps={{ htmlInput: { min: 0 } }}
                {...register("value", { valueAsNumber: true })}
              />

              <TextField
                label="Currency"
                placeholder="e.g. USD, VND"
                error={Boolean(errors.currency)}
                helperText={errors.currency?.message}
                fullWidth
                size="small"
                sx={fieldSx}
                {...register("currency")}
              />

              <TextField
                label="Sponsor Name"
                placeholder="e.g. Google"
                error={Boolean(errors.sponsorName)}
                helperText={errors.sponsorName?.message}
                fullWidth
                size="small"
                sx={fieldSx}
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
                sx={fieldSx}
                className="md:col-span-2"
                {...register("description")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            <Button
              onClick={onClose}
              disabled={isSubmitting}
              variant="outlined"
              sx={{ textTransform: "none", borderRadius: "10px", fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="contained"
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                fontWeight: 800,
                boxShadow: "none",
                bgcolor: "#d97706",
                "&:hover": { bgcolor: "#b45309" },
              }}
            >
              {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Prize"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Dialog>
  );
};
