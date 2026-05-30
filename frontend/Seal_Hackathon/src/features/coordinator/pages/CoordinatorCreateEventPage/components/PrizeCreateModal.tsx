import { useEffect } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  prizeRankOptions,
  prizeCurrencyOptions,
  type PrizeFormValues,
  type TrackFormValues,
} from "../../../schemas/createEvent.schema";

type PrizeCreateModalProps = {
  open: boolean;
  tracks: TrackFormValues[];
  initialPrize?: PrizeFormValues | null;
  onClose: () => void;
  onSave: (prize: PrizeFormValues) => void;
};

const WHOLE_EVENT_VALUE = "__WHOLE_EVENT__";
const WHOLE_TRACK_VALUE = "__WHOLE_TRACK__";

export const PrizeCreateModal = ({
  open,
  tracks,
  initialPrize,
  onClose,
  onSave,
}: PrizeCreateModalProps) => {
  const isEditMode = Boolean(initialPrize);

  const methods = useForm<PrizeFormValues>({
    resolver: zodResolver(createEventPrizeSchema),
    defaultValues: createEmptyPrize(),
    mode: "onSubmit",
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = methods;

  const selectedTrackId = useWatch({
    control,
    name: "targetTrackId",
  });

  const selectedCurrency = useWatch({
    control,
    name: "currency",
  });

  const selectedTrack = tracks.find((track) => track.id === selectedTrackId);
  const roundOptions = selectedTrack?.rounds ?? [];

  useEffect(() => {
    if (!open) return;

    if (initialPrize) {
      reset(initialPrize);
      return;
    }

    reset(createEmptyPrize());
  }, [open, initialPrize, reset]);

  const handleSave = handleSubmit((values) => {
    onSave(values);
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 800 }}>
        {isEditMode ? "Edit Prize" : "Create Prize"}
      </DialogTitle>

      <FormProvider {...methods}>
        <DialogContent dividers>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Controller
              name="rank"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Rank"
                  error={Boolean(errors.rank)}
                  helperText={errors.rank?.message}
                  fullWidth
                  size="small"
                >
                  {prizeRankOptions.map((rank) => (
                    <MenuItem key={rank} value={rank}>
                      {rank}
                    </MenuItem>
                  ))}
                </TextField>
              )}
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

            <TextField
              label="Prize Value"
              placeholder="e.g. 5000000"
              error={Boolean(errors.value)}
              helperText={errors.value?.message}
              fullWidth
              required
              size="small"
              type="number"
              slotProps={{
                input: {
                  inputProps: {
                    min: 1,
                  },
                },
              }}
              {...register("value")}
            />

            <div
              className={
                selectedCurrency === "Other"
                  ? "grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr]"
                  : "grid grid-cols-1"
              }
            >
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Currency"
                    error={Boolean(errors.currency)}
                    helperText={errors.currency?.message}
                    fullWidth
                    required
                    size="small"
                    onChange={(event) => {
                      field.onChange(event.target.value);

                      if (event.target.value !== "Other") {
                        setValue("customCurrency", "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                  >
                    {prizeCurrencyOptions.map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              {selectedCurrency === "Other" && (
                <TextField
                  label="Custom Unit"
                  placeholder="e.g. Laptop, Scholarship"
                  error={Boolean(errors.customCurrency)}
                  helperText={errors.customCurrency?.message}
                  fullWidth
                  required
                  size="small"
                  {...register("customCurrency")}
                />
              )}
            </div>

            <Controller
              name="targetTrackId"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Track"
                  value={field.value || WHOLE_EVENT_VALUE}
                  onChange={(event) => {
                    const selectedValue = event.target.value;

                    field.onChange(
                      selectedValue === WHOLE_EVENT_VALUE ? "" : selectedValue,
                    );

                    setValue("targetRoundId", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  error={Boolean(errors.targetTrackId)}
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
              )}
            />

            {selectedTrackId && (
              <Controller
                name="targetRoundId"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Round"
                    value={field.value || WHOLE_TRACK_VALUE}
                    onChange={(event) => {
                      const selectedValue = event.target.value;

                      field.onChange(
                        selectedValue === WHOLE_TRACK_VALUE
                          ? ""
                          : selectedValue,
                      );
                    }}
                    error={Boolean(errors.targetRoundId)}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value={WHOLE_TRACK_VALUE}>Whole Track</MenuItem>

                    {roundOptions.length === 0 && (
                      <MenuItem disabled value="__NO_ROUNDS__">
                        No rounds in this track
                      </MenuItem>
                    )}

                    {roundOptions.map((round, index) => (
                      <MenuItem key={round.id} value={round.id}>
                        {index + 1}. {round.roundName || "Unnamed Round"}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}

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
