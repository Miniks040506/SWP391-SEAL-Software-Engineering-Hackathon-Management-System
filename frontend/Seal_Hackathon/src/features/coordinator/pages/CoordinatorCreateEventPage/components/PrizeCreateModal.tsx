import { useEffect } from "react";
import { Controller, FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import {
  createEmptyPrize,
  createEventPrizeSchema,
  prizeCurrencyOptions,
  type PrizeFormValues,
  type TrackFormValues,
} from "../../../schemas/createEvent.schema";

type PrizeCreateModalProps = {
  open: boolean;
  tracks: TrackFormValues[];
  initialPrize?: PrizeFormValues | null;

  /**
   * null = không khóa track, user được chọn Whole Event hoặc track.
   * "" = khóa Whole Event.
   * "track-id" = khóa track cụ thể.
   */
  lockedTrackId: string | null;

  isTrackLocked: boolean;
  onClose: () => void;
  onSave: (prize: PrizeFormValues) => void;
};

const WHOLE_EVENT_VALUE = "__WHOLE_EVENT__";

export const PrizeCreateModal = ({
  open,
  tracks,
  initialPrize,
  lockedTrackId,
  isTrackLocked,
  onClose,
  onSave,
}: PrizeCreateModalProps) => {
  const isEditMode = Boolean(initialPrize);

  const methods = useForm<PrizeFormValues>({
    resolver: zodResolver(createEventPrizeSchema) as Resolver<PrizeFormValues>,
    defaultValues: createEmptyPrize(),
    mode: "onSubmit",
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (!open) return;

    if (initialPrize) {
      reset(initialPrize);
      return;
    }

    reset({
      ...createEmptyPrize(),
      trackId: isTrackLocked ? (lockedTrackId ?? "") : "",
    });
  }, [open, initialPrize, lockedTrackId, isTrackLocked, reset]);

  const handleSave = handleSubmit((values) => {
    const finalTrackId = isTrackLocked ? (lockedTrackId ?? "") : values.trackId;

    onSave({
      ...values,
      trackId: finalTrackId,
    });

    onClose();
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{ paper: { sx: { borderRadius: "20px" } } }}
    >
      <DialogTitle sx={{ fontWeight: 900 }}>
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-400 text-white shadow-md shadow-amber-500/25">
            <EmojiEventsOutlinedIcon sx={{ fontSize: 19 }} />
          </span>
          {isEditMode ? "Edit Prize" : "Create Prize"}
        </span>
      </DialogTitle>

      <FormProvider {...methods}>
        <DialogContent dividers>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <TextField
              label="Rank Position"
              placeholder="e.g. 1"
              type="number"
              error={Boolean(errors.rankPosition)}
              helperText={errors.rankPosition?.message}
              fullWidth
              required
              size="small"
              slotProps={{
                input: {
                  inputProps: {
                    min: 1,
                  },
                },
              }}
              {...register("rankPosition")}
            />

            <TextField
              label="Prize Title"
              placeholder="e.g. Champion Award"
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
              fullWidth
              required
              size="small"
              {...register("title")}
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_150px]">
              <TextField
                label="Prize Value"
                placeholder="e.g. 5000000"
                type="number"
                error={Boolean(errors.value)}
                helperText={errors.value?.message}
                fullWidth
                required
                size="small"
                slotProps={{
                  input: {
                    inputProps: {
                      min: 1,
                    },
                  },
                }}
                {...register("value")}
              />

              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Currency"
                    value={field.value}
                    onChange={field.onChange}
                    error={Boolean(errors.currency)}
                    helperText={errors.currency?.message}
                    fullWidth
                    required
                    size="small"
                  >
                    {prizeCurrencyOptions.map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </div>

            <Controller
              name="trackId"
              control={control}
              render={({ field }) => {
                const selectedValue =
                  isTrackLocked
                    ? lockedTrackId || WHOLE_EVENT_VALUE
                    : field.value || WHOLE_EVENT_VALUE;

                return (
                  <TextField
                    select
                    label="Track"
                    value={selectedValue}
                    disabled={isTrackLocked}
                    onChange={(event) => {
                      const value = event.target.value;

                      field.onChange(
                        value === WHOLE_EVENT_VALUE ? "" : value,
                      );
                    }}
                    error={Boolean(errors.trackId)}
                    helperText={
                      isTrackLocked
                        ? "This prize target is locked."
                        : "Choose Whole Event or a specific track."
                    }
                    fullWidth
                    size="small"
                  >
                    <MenuItem value={WHOLE_EVENT_VALUE}>Whole Event</MenuItem>

                    {tracks.map((track) => (
                      <MenuItem key={track.id} value={track.id}>
                        {track.trackName}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              }}
            />

            <TextField
              label="Sponsor Name"
              placeholder="e.g. FPT Software"
              error={Boolean(errors.sponsorName)}
              helperText={errors.sponsorName?.message}
              fullWidth
              size="small"
              {...register("sponsorName")}
            />

            <TextField
              label="Description"
              placeholder="Brief prize description"
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
              multiline
              minRows={3}
              fullWidth
              className="md:col-span-2"
              {...register("description")}
            />
          </div>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button type="button" variant="outlined" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="button"
            variant="contained"
            onClick={handleSave}
            sx={{
              bgcolor: "#2563eb",
              fontWeight: 800,
              "&:hover": {
                bgcolor: "#1d4ed8",
              },
            }}
          >
            {isEditMode ? "Save Changes" : "Save Prize"}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};
