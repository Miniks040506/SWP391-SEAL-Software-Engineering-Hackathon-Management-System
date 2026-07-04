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

  const methods = useForm({
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

  const currentRounds =
    useWatch({
      control,
      name: "rounds",
    }) ?? [];

  const canAddRound = Boolean(trackName?.trim());

  useEffect(() => {
    if (!open) return;

    if (initialTrack) {
      reset({
        ...createEmptyTrack(),
        ...initialTrack,
        requiredLinkTypes: initialTrack.requiredLinkTypes ?? [],
        rounds: initialTrack.rounds ?? [],
      });
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
    onSave(values as TrackFormValues);
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

                  const handleToggleLinkType = (
                    linkType: (typeof SUBMISSION_LINK_TYPES)[number],
                  ) => {
                    const nextValues = selectedValues.includes(linkType)
                      ? selectedValues.filter((value) => value !== linkType)
                      : [...selectedValues, linkType];

                    field.onChange(nextValues);
                  };

                  return (
                    <div className="md:col-span-2">
                      <p className="mb-2 text-sm font-semibold text-gray-700">
                        Required Submission Links
                      </p>

                      <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
                        {SUBMISSION_LINK_TYPES.map((linkType) => {
                          const checked = selectedValues.includes(linkType);

                          return (
                            <button
                              key={linkType}
                              type="button"
                              onClick={() => handleToggleLinkType(linkType)}
                              className={[
                                "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                                checked
                                  ? "border-blue-300 bg-blue-50 text-blue-700"
                                  : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50/40",
                              ].join(" ")}
                            >
                              <Checkbox
                                checked={checked}
                                tabIndex={-1}
                                disableRipple
                                sx={{
                                  p: 0,
                                  color: "#94a3b8",
                                  "&.Mui-checked": {
                                    color: "#2563eb",
                                  },
                                }}
                              />

                              <span className="text-sm">{linkType}</span>
                            </button>
                          );
                        })}
                      </div>

                      {selectedValues.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedValues.map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              size="small"
                              sx={{ fontWeight: 700 }}
                            />
                          ))}
                        </div>
                      )}

                      {errors.requiredLinkTypes?.message && (
                        <p className="mt-2 text-sm font-semibold text-red-600">
                          {errors.requiredLinkTypes.message}
                        </p>
                      )}
                    </div>
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
                  const roundErrors = errors.rounds?.[roundIndex] as any;

                  return (
                    <div
                      key={round.fieldId}
                      className="rounded-xl border border-gray-200 bg-white p-5"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-gray-900">
                            Round {roundIndex + 1}
                          </h4>
                          {currentRounds.length > 0 &&
                            roundIndex === currentRounds.length - 1 && (
                              <Chip
                                size="small"
                                label="Final"
                                color="success"
                                sx={{
                                  fontWeight: 800,
                                  height: 20,
                                  fontSize: "0.65rem",
                                }}
                              />
                            )}
                        </div>

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
                          type="number"
                          value={roundIndex + 1}
                          fullWidth
                          disabled
                          size="small"
                        />
                        <input
                          type="hidden"
                          value={roundIndex + 1}
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
                          required
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
