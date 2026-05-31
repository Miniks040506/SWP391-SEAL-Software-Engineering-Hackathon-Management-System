import { useEffect } from "react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Chip from "@mui/material/Chip";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import {
  ADVANCEMENT_RULE_TYPES,
  SUBMISSION_LINK_TYPES,
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <TextField
                label="Track Name"
                placeholder="e.g. Web Development"
                error={Boolean(errors.trackName)}
                helperText={errors.trackName?.message}
                fullWidth
                required
                size="small"
                {...register("trackName")}
              />

              <TextField
                label="Max Teams"
                placeholder="e.g. 20"
                type="number"
                error={Boolean(errors.maxTeams)}
                helperText={errors.maxTeams?.message}
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    inputProps: {
                      min: 1,
                    },
                  },
                }}
                {...register("maxTeams")}
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
                className="md:col-span-2"
                {...register("description")}
              />

              <Controller
                name="requiredLinkTypes"
                control={control}
                render={({ field }) => {
                  const selectedValues = Array.isArray(field.value)
                    ? field.value
                    : [];

                  return (
                    <TextField
                      select
                      label="Required Submission Links"
                      value={selectedValues}
                      onChange={(event) => {
                        const value = event.target.value;

                        field.onChange(
                          typeof value === "string" ? value.split(",") : value,
                        );
                      }}
                      SelectProps={{
                        multiple: true,
                        renderValue: (selected) => {
                          const values = selected as string[];

                          if (values.length === 0) {
                            return "No required links";
                          }

                          return (
                            <div className="flex flex-wrap gap-1">
                              {values.map((value) => (
                                <Chip
                                  key={value}
                                  label={value}
                                  size="small"
                                  sx={{ fontWeight: 700 }}
                                />
                              ))}
                            </div>
                          );
                        },
                      }}
                      error={Boolean(errors.requiredLinkTypes)}
                      helperText={errors.requiredLinkTypes?.message}
                      fullWidth
                      size="small"
                      className="md:col-span-2"
                    >
                      {SUBMISSION_LINK_TYPES.map((linkType) => (
                        <MenuItem key={linkType} value={linkType}>
                          <Checkbox
                            size="small"
                            checked={selectedValues.includes(linkType)}
                          />
                          {linkType}
                        </MenuItem>
                      ))}
                    </TextField>
                  );
                }}
              />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-slate-50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-gray-900">Rounds</h3>

                  <p className="text-sm text-gray-500">
                    Add rounds for this track. Round order will be sent to the
                    backend as orderIndex.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<AddOutlinedIcon />}
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

                        <TextField
                          label="Order Index"
                          placeholder="e.g. 1"
                          type="number"
                          error={Boolean(roundErrors?.orderIndex)}
                          helperText={roundErrors?.orderIndex?.message}
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
                          {...register(`rounds.${roundIndex}.orderIndex`)}
                        />

                        <TextField
                          label="Submission Deadline"
                          type="datetime-local"
                          error={Boolean(roundErrors?.submissionDeadline)}
                          helperText={roundErrors?.submissionDeadline?.message}
                          fullWidth
                          size="small"
                          slotProps={{
                            inputLabel: {
                              shrink: true,
                            },
                          }}
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
                          size="small"
                          slotProps={{
                            inputLabel: {
                              shrink: true,
                            },
                          }}
                          {...register(`rounds.${roundIndex}.judgingDeadline`)}
                        />

                        <FormControlLabel
                          control={
                            <Controller
                              name={`rounds.${roundIndex}.isFinal`}
                              control={control}
                              render={({ field }) => (
                                <Checkbox
                                  checked={Boolean(field.value)}
                                  onChange={(event) =>
                                    field.onChange(event.target.checked)
                                  }
                                />
                              )}
                            />
                          }
                          label="Final round"
                        />

                        <Controller
                          name={`rounds.${roundIndex}.advancementRuleType`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              select
                              label="Advancement Rule"
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
                          label="Rule Value"
                          placeholder="e.g. 10"
                          error={Boolean(roundErrors?.advancementRuleValue)}
                          helperText={
                            roundErrors?.advancementRuleValue?.message
                          }
                          fullWidth
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
            {isEditMode ? "Save Changes" : "Save Track"}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};
