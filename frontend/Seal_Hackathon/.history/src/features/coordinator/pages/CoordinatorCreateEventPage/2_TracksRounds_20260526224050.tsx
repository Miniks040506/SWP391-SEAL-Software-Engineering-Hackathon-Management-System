import { useEffect, useState } from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import {
  ADVANCEMENT_RULE_TYPES,
  createEmptyRound,
  createEmptyTrack,
  type CreateEventFormValues,
} from "./createEvent.schema";

type TracksRoundsStepProps = {
  onNext: () => void;
  onBack: () => void;
};

type RoundPanelProps = {
  trackIndex: number;
};

const RoundPanel = ({ trackIndex }: RoundPanelProps) => {
  const {
    register,
    control,
    getValues,
    trigger,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();

  const {
    fields: roundFields,
    append: appendRound,
    remove: removeRound,
  } = useFieldArray({
    control,
    name: `tracks.${trackIndex}.rounds`,
    keyName: "fieldId",
  });

  const trackErrors = errors.tracks?.[trackIndex];
  const trackName = useWatch({
    control,
    name: `tracks.${trackIndex}.trackName`,
  });

  const canAddRound = Boolean(trackName?.trim());

  const handleAddRound = async () => {
    const isTrackNameValid = await trigger(`tracks.${trackIndex}.trackName`, {
      shouldFocus: true,
    });

    const currentTrackName = getValues(`tracks.${trackIndex}.trackName`);

    if (!isTrackNameValid || !currentTrackName.trim()) {
      return;
    }

    appendRound(createEmptyRound());
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
        <div>
          <h3 className="text-base font-extrabold text-gray-900">
            Track {trackIndex + 1}
          </h3>
          <p className="text-sm text-gray-500">
            Configure track information and its rounds.
          </p>

          {trackErrors?.rounds?.root?.message && (
            <p className="mt-1 text-sm font-semibold text-red-600">
              {trackErrors.rounds.root.message}
            </p>
          )}

          {!canAddRound && (
            <p className="mt-1 text-sm font-semibold text-red-600">
              Enter track name before adding rounds.
            </p>
          )}
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

      <div className="space-y-4 px-6 py-6">
        {roundFields.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-slate-50 px-5 py-10 text-center">
            <p className="text-sm font-semibold text-gray-500">
              No rounds created for this track.
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Add a round after entering the track name.
            </p>
          </div>
        )}

        {roundFields.map((roundField, roundIndex) => {
          const roundErrors = trackErrors?.rounds?.[roundIndex];

          return (
            <div
              key={roundField.fieldId}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-extrabold text-gray-900">
                  Round {roundIndex + 1}
                </h4>

                <Button
                  type="button"
                  color="error"
                  size="small"
                  variant="text"
                  startIcon={<DeleteOutlineOutlinedIcon />}
                  onClick={() => removeRound(roundIndex)}
                >
                  Delete Round
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <TextField
                  label="Round Name"
                  placeholder="e.g. Preliminary Round"
                  error={Boolean(roundErrors?.roundName)}
                  helperText={roundErrors?.roundName?.message}
                  fullWidth
                  size="small"
                  required
                  {...register(
                    `tracks.${trackIndex}.rounds.${roundIndex}.roundName`,
                  )}
                />

                <Controller
                  name={`tracks.${trackIndex}.rounds.${roundIndex}.advancementRuleType`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      label="Rule Type"
                      value={field.value}
                      onChange={field.onChange}
                      error={Boolean(roundErrors?.advancementRuleType)}
                      helperText={roundErrors?.advancementRuleType?.message}
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
                  size="small"
                  required
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  {...register(
                    `tracks.${trackIndex}.rounds.${roundIndex}.submissionDeadline`,
                  )}
                />

                <TextField
                  label="Judging Deadline"
                  type="datetime-local"
                  error={Boolean(roundErrors?.judgingDeadline)}
                  helperText={roundErrors?.judgingDeadline?.message}
                  fullWidth
                  size="small"
                  required
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  {...register(
                    `tracks.${trackIndex}.rounds.${roundIndex}.judgingDeadline`,
                  )}
                />

                <TextField
                  label="Value"
                  placeholder="e.g. 10"
                  error={Boolean(roundErrors?.advancementRuleValue)}
                  helperText={roundErrors?.advancementRuleValue?.message}
                  fullWidth
                  size="small"
                  required
                  {...register(
                    `tracks.${trackIndex}.rounds.${roundIndex}.advancementRuleValue`,
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TracksRoundsStep = ({ onNext, onBack }: TracksRoundsStepProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();

  const {
    fields: trackFields,
    append: appendTrack,
    remove: removeTrack,
  } = useFieldArray({
    control,
    name: "tracks",
    keyName: "fieldId",
  });

  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);

  const tracks = useWatch({
    control,
    name: "tracks",
  });

  const tracksRootError = errors.tracks?.root?.message;
  const selectedTrack = tracks?.[selectedTrackIndex];

  useEffect(() => {
    if (trackFields.length === 0) {
      setSelectedTrackIndex(0);
      return;
    }

    setSelectedTrackIndex((prev) => {
      if (prev > trackFields.length - 1) {
        return trackFields.length - 1;
      }
      return prev;
    });
  }, [trackFields.length]);

  const handleAddTrack = () => {
    appendTrack(createEmptyTrack());
    setSelectedTrackIndex(trackFields.length);
  };

  const handleDeleteTrack = (trackIndex: number) => {
    removeTrack(trackIndex);

    if (trackIndex === selectedTrackIndex) {
      setSelectedTrackIndex(Math.max(trackIndex - 1, 0));
      return;
    }

    if (trackIndex < selectedTrackIndex) {
      setSelectedTrackIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-7 py-5">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">
            Step 2: Tracks & Rounds
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage tracks on the left, then configure rounds for the selected
            track on the right.
          </p>

          {tracksRootError && (
            <p className="mt-1 text-sm font-semibold text-red-600">
              {tracksRootError}
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={handleAddTrack}
          sx={{
            bgcolor: "white",
            color: "#2563eb",
            border: "1px solid #bfdbfe",
            fontWeight: 800,
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#eff6ff",
              boxShadow: "none",
            },
          }}
        >
          Add Track
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 px-7 py-6 xl:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
          <div className="mb-4">
            <h3 className="font-extrabold text-gray-900">Tracks</h3>
            <p className="text-sm text-gray-500">
              Click a track to manage its rounds.
            </p>
          </div>

          {trackFields.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-8 text-center">
              <p className="text-sm font-semibold text-gray-500">
                No tracks added yet.
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Click Add Track to create the first track.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {trackFields.map((trackField, trackIndex) => {
              const active = selectedTrackIndex === trackIndex;
              const trackError = errors.tracks?.[trackIndex];
              const currentTrack = tracks?.[trackIndex];

              return (
                <button
                  key={trackField.fieldId}
                  type="button"
                  onClick={() => setSelectedTrackIndex(trackIndex)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    active
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p
                        className={`text-sm font-extrabold ${
                          active ? "text-blue-700" : "text-gray-900"
                        }`}
                      >
                        {currentTrack?.trackName?.trim()
                          ? currentTrack.trackName
                          : `Track ${trackIndex + 1}`}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {(currentTrack?.rounds ?? []).length} round(s)
                      </p>
                    </div>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteTrack(trackIndex);
                      }}
                    >
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </div>

                  <TextField
                    label="Track Name"
                    placeholder="e.g. Web Development Track"
                    error={Boolean(trackError?.trackName)}
                    helperText={trackError?.trackName?.message}
                    fullWidth
                    size="small"
                    required
                    onClick={(event) => event.stopPropagation()}
                    {...register(`tracks.${trackIndex}.trackName`)}
                  />

                  <TextField
                    label="Track Description"
                    placeholder="Brief description"
                    multiline
                    minRows={2}
                    fullWidth
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={(event) => event.stopPropagation()}
                    {...register(`tracks.${trackIndex}.description`)}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {trackFields.length === 0 && (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">
                  No track selected
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Add a track first, then configure rounds here.
                </p>
              </div>
            </div>
          )}

          {trackFields.length > 0 && selectedTrack && (
            <RoundPanel trackIndex={selectedTrackIndex} />
          )}
        </div>
      </div>

      <div className="flex justify-between border-t border-gray-100 px-7 py-5">
        <Button type="button" variant="outlined" onClick={onBack}>
          Back
        </Button>

        <Button
          type="button"
          variant="contained"
          endIcon={<ArrowForwardOutlinedIcon />}
          onClick={onNext}
          sx={{
            px: 2.5,
            py: 1.1,
            borderRadius: 2,
            bgcolor: "#2563eb",
            fontWeight: 800,
            "&:hover": {
              bgcolor: "#1d4ed8",
            },
          }}
        >
          Next Step
        </Button>
      </div>
    </section>
  );
};
