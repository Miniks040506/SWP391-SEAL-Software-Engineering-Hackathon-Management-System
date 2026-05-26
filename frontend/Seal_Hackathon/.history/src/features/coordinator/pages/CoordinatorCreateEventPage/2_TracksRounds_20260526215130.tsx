import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

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

type TrackRoundsStepProps = {
    trackIndex: number;
    trackFieldId: string;
    onDeleteTrack: () => void;
};

const TrackCard = ({
    trackIndex,
    trackFieldId,
    onDeleteTrack,
} : TrackCardProps) => {
    const {
        register,
        control,
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
    const roundsRootError = trackErrors?.rounds?.root?.message;

    return (
        <div
            key={trackFieldId}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h3 className="text-base font-extrabold text-gray-900">
                        Track {trackIndex + 1}
                    </h3>
                    <p className="text-sm text-gray-500">
                        Configure track information and its rounds.
                    </p>
                </div>

                <Button
                    type="button"
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteOutlineOutlinedIcon />}
                    onClick={onDeleteTrack}
                >
                    Delete Track
                </Button>
            </div>

            <TextField
                label="Track Name"
                placeholder="e.g. Web Development Track"
                error={Boolean(trackErrors?.trackName)}
                helperText={trackErrors?.trackName?.message}
                fullWidth
                size="small"
                required
                {...register(`tracks.${trackIndex}.trackName`)}
            />

            <TextField 
                label="Track Description"
                placeholder="e.g. A track for web development challenges"
                multiline
                minRows={3}
                fullWidth
                sx={{ mt: 3 }}
                {...register(`tracks.${trackIndex}.trackDescription`)}
            />

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-gray-900">Rounds</h4>
            <p className="text-sm text-gray-500">
              Create one or more rounds for this track.
            </p>
            {roundRootError && (
              <p className="mt-1 text-sm font-semibold text-red-600">
                {roundRootError}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outlined"
            startIcon={<AddOutlinedIcon />}
            onClick={() => appendRound(createEmptyRound())}
          >
            Add Round
          </Button>
        </div>

        {roundFields.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-8 text-center">
            <p className="text-sm font-semibold text-gray-500">
              No rounds created for this track.
            </p>
          </div>
        )}

        <div className="space-y-4">
            {roundFields.map((roundField, roundIndex) => {
                const roundErrors = trackErrors?.rounds?.[roundIndex];
                
                return (
                    <div
                        key={roundField.fieldId}
                        className="rounded-xl border border-gray-200 bg-white p-5"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h5 className="font-extrabold text-gray-900">
                                Round {roundIndex + 1}
                            </h5>

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
                                {...register(`tracks.${trackIndex}.rounds.${roundIndex}.roundName`)}
                            />

                            <Controller
                                name={`tracks.${trackIndex}.rounds.${roundIndex}.advancementRuleType` as const}
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
                                slotProps={{ inputLabel: {
                        shrink: true,
                      }, }}
                                {...register(`tracks.${trackIndex}.rounds.${roundIndex}.submissionDeadline`)}
                            />

                            <TextField
                                label="Judging Deadline"
                                type="datetime-local"
                                error={Boolean(roundErrors?.judgingDeadline)}
                                helperText={roundErrors?.judgingDeadline?.message}
                                fullWidth
                                size="small"
                                required
                                slotProps={{ inputLabel: {
                        shrink: true,
                      }, }}
                                {...register(`tracks.${trackIndex}.rounds.${roundIndex}.judgingDeadline`)}
                            />
                        </div>
                    </div>
                );
            }