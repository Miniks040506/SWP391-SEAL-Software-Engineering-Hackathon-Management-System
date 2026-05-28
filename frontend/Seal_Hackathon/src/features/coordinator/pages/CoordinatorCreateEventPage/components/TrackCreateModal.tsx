import { useEffect } from "react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  IconButton,
} from "@mui/material";

import AddOutlinedICon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import {
  ADVANCEMENT_RULE_TYPES,
  createEmptyRound,
  createEmptyTrack,
  createEventTrackSchema,
  type TrackFormValues,
} from "../../../schemas/createEvent.schema";

type TrackCreateModalProps = {
  open: boolean;
  initialTrack?: TrackFormValues | null;
  onClose: () => void;
  onSave: (track: TrackFormValues) => void;
};

export const TrackCreateModal = ({
  open,
  onClose,
  onSave,
  initialTrack,
}: TrackCreateModalProps) => {
  const isEditMode = Boolean(initialTrack);

  const methods = useForm<TrackFormValues>({
    resolver: zodResolver(createEventTrackSchema),
    defaultValues: createEmptyTrack(),
    mode: "onSubmit",
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = methods;

  const {
    fields: roundFields,
    append: appendRound,
    remove: removeRound,
  } = useFieldArray({
    control,
    name: "rounds",
    keyName: "fieldId",
  });

  const trackName = useWatch({
    control,
    name: "trackName",
  });

  const canAddRound = Boolean(trackName?.trim());

  useEffect(() => {
    if (!open) return;

    if (initialTrack) {
      reset(initialTrack);
      return;
    }
    reset(createEmptyTrack());
  }, [open, initialTrack, reset]);

  const handleAddRound = async () => {
    const isTracknameValid = await trigger("trackName", {
      shouldFocus: true,
    });

    if (!isTracknameValid || !trackName?.trim()) {
      return;
    }

    appendRound(createEmptyRound());
  };

  const handleSave = handleSubmit((values) => {
    onSave(values);
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 800 }}>
        {isEditMode ? "Edit Track & Rounds" : "Create Track & Rounds"}
      </DialogTitle>

      <FormProvider {...methods}>
        <DialogContent dividers>
          <div className="space-y-6">
            <TextField
              label="Track Name"
              placeholder="e.g. Web Development Track"
              error={Boolean(errors.trackName)}
              helperText={errors.trackName?.message}
              fullWidth
              required
              size="small"
              {...register("trackName")}
            />

            <TextField
              label="Track Description"
              placeholder="Brief description of this track"
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
              multiline
              minRows={3}
              fullWidth
              size="small"
              {...register("description")}
            />

            <div className="rounded-2xl border border-gray-200 bg-slate-50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-gray-900">Rounds</h3>

                  <p className="text-sm text-gray-500">
                    Add rounds after entering track name.
                  </p>

                  {errors.rounds?.root?.message && (
                    <p className="mt-1 text-sm font-semibold text-red-600">
                      {errors.rounds.root.message}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<AddOutlinedICon />}
                  disabled={!canAddRound}
                  onClick={handleAddRound}
                >
                  Add Round
                </Button>
              </div>

              {roundFields.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-8 text-center">
                  <p className="text-sm font-semibold text-gray-500">
                    No rounds added yet.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {roundFields.map((round, roundIndex) => {
                  const roundErrors = errors.rounds?.[roundIndex];

                  return (
                    <div
                      key={round.fieldId}
                      className="rounded-xl border border-gray-200 bg-white p-5"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="font-extrabold text-gray-900">
                          Round {roundIndex + 1}
                        </h4>

                        <IconButton
                          color="error"
                          onClick={() => removeRound(roundIndex)}
                        >
                          <DeleteOutlineOutlinedIcon />
                        </IconButton>
                      </div>

                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <TextField
                          label="Round Name"
                          placeholder="e.g. Preliminary Round"
                          error={Boolean(roundErrors?.roundName)}
                          helperText={roundErrors?.roundName?.message}
                          fullWidth
                          required
                          size="small"
                          {...register(`rounds.${roundIndex}.roundName`)}
                        />

                        <Controller
                          name={`rounds.${roundIndex}.advancementRuleType`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              select
                              label="Rule Type"
                              error={Boolean(roundErrors?.advancementRuleType)}
                              helperText={
                                roundErrors?.advancementRuleType?.message
                              }
                              fullWidth
                              size="small"
                            >
                              {ADVANCEMENT_RULE_TYPES.map((ruleType) => (
                                <MenuItem key={ruleType} value={ruleType}>
                                  {ruleType}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        />

                        <TextField
                          label="Submission Deadline"
                          type="datetime-local"
                          error={Boolean(roundErrors?.submissionDeadline)}
                          helperText={roundErrors?.submissionDeadline?.message}
                          fullWidth
                          required
                          size="small"
                          slotProps={{ inputLabel: { shrink: true } }}
                          {...register(
                            `rounds.${roundIndex}.submissionDeadline`,
                          )}
                        />

                        <TextField
                          label="Judging Deadline"
                          type="datetime-local"
                          error={Boolean(roundErrors?.judgingDeadline)}
                          helperText={roundErrors?.judgingDeadline?.message}
                          fullWidth
                          required
                          size="small"
                          slotProps={{ inputLabel: { shrink: true } }}
                          {...register(`rounds.${roundIndex}.judgingDeadline`)}
                        />

                        <TextField
                          label="Value"
                          placeholder="e.g. 10"
                          error={Boolean(roundErrors?.advancementRuleValue)}
                          helperText={
                            roundErrors?.advancementRuleValue?.message
                          }
                          fullWidth
                          required
                          size="small"
                          {...register(
                            `rounds.${roundIndex}.advancementRuleValue`,
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
            Save Track
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};
