import React, { useEffect, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BenchmarkScoreMatrix } from "./BenchmarkScoreMatrix";
import type { EventCriteriaResponse } from "@/types/criteria.types";
import type { SubmissionSummaryResponse, CoordinatorSubmissionSummaryResponse } from "@/types/submission.types";
import type { RoundResponse } from "@/types/round.types";
import { format, parseISO } from "date-fns";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import GridOnOutlinedIcon from "@mui/icons-material/GridOnOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Button, Checkbox, FormControlLabel, MenuItem, TextField } from "@mui/material";

const calibrationFormSchema = z.object({
    description: z.string().optional(),
    mandatory: z.boolean().default(false),
    roundId: z.string().min(1, "Round is required"),
    sampleSubmissionId: z.string().min(1, "Sample submission is required"),
    startAt: z.string().min(1, "Start time is required"),
    endAt: z.string().min(1, "End time is required"),
    benchmarkScores: z.record(z.string(), z.number().min(0)),
}).refine((data) => {
    if (data.startAt && data.endAt) {
        return new Date(data.endAt) > new Date(data.startAt);
    }
    return true;
}, {
    message: "End time must be after start time",
    path: ["endAt"],
});

export type CalibrationFormValues = z.infer<typeof calibrationFormSchema>;

interface CalibrationRoundFormProps {
    initialValues?: Partial<CalibrationFormValues>;
    criteria: EventCriteriaResponse[];
    rounds: RoundResponse[];
    submissions: SubmissionSummaryResponse[] | CoordinatorSubmissionSummaryResponse[];
    onRoundChange: (roundId: string) => void;
    onSubmit: (data: CalibrationFormValues) => void;
    isLoading: boolean;
    isReadOnly?: boolean;
}

const formatDateForInput = (isoDate?: string | null) => {
    if (!isoDate) return "";
    try {
        return format(parseISO(isoDate), "yyyy-MM-dd'T'HH:mm");
    } catch (e) {
        return "";
    }
};

const textFieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "10px" } };
const dateTimeFieldSx = {
    "& .MuiOutlinedInput-root": { borderRadius: "10px" },
    "& .MuiInputLabel-root": { backgroundColor: "white", paddingInline: "4px" },
    ".dark & .MuiInputLabel-root": { backgroundColor: "#0f172a" },
};

export const CalibrationRoundForm = ({
    initialValues,
    criteria,
    rounds,
    submissions,
    onRoundChange,
    onSubmit,
    isLoading,
    isReadOnly,
}: CalibrationRoundFormProps) => {
    const methods = useForm<CalibrationFormValues>({
        resolver: zodResolver(calibrationFormSchema),
        defaultValues: {
            description: initialValues?.description || "",
            mandatory: initialValues?.mandatory || false,
            roundId: initialValues?.roundId || "",
            sampleSubmissionId: initialValues?.sampleSubmissionId || "",
            startAt: formatDateForInput(initialValues?.startAt),
            endAt: formatDateForInput(initialValues?.endAt),
            benchmarkScores: initialValues?.benchmarkScores || {},
        },
    });

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = methods;

    const selectedRoundId = watch("roundId");
    const selectedSubmissionId = watch("sampleSubmissionId");

    useEffect(() => {
        if (selectedRoundId) {
            onRoundChange(selectedRoundId);
        }
    }, [selectedRoundId, onRoundChange]);

    const selectedSubmission = useMemo(() => {
        return submissions.find((s) => s.id === selectedSubmissionId);
    }, [submissions, selectedSubmissionId]);

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Section 1: Basic Information</h2>
                    </div>
                    <div className="space-y-5 p-6">
                        <TextField
                            label="Description / Name"
                            fullWidth
                            {...register("description")}
                            disabled={isReadOnly}
                            error={!!errors.description}
                            helperText={errors.description?.message as string}
                            sx={textFieldSx}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    {...register("mandatory")}
                                    disabled={isReadOnly}
                                    checked={watch("mandatory")}
                                />
                            }
                            label={
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    Mandatory for judges before real grading
                                </span>
                            }
                        />
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Section 2: Sample Submission</h2>
                    </div>
                    <div className="space-y-5 p-6">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <TextField
                                select
                                label="Round"
                                fullWidth
                                {...register("roundId")}
                                value={watch("roundId") || ""}
                                disabled={isReadOnly}
                                error={!!errors.roundId}
                                helperText={errors.roundId?.message as string}
                                sx={textFieldSx}
                            >
                                <MenuItem value="">Select a round</MenuItem>
                                {rounds.map((r) => (
                                    <MenuItem key={r.id} value={r.id}>
                                        {r.name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Submission"
                                fullWidth
                                {...register("sampleSubmissionId")}
                                value={watch("sampleSubmissionId") || ""}
                                disabled={isReadOnly || !selectedRoundId}
                                error={!!errors.sampleSubmissionId}
                                helperText={errors.sampleSubmissionId?.message as string}
                                sx={textFieldSx}
                            >
                                <MenuItem value="">Select a submission</MenuItem>
                                {submissions.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>
                                        {s.teamName || `Team ID: ${s.teamId}`} - {s.projectTitle || "Untitled"}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>

                        {selectedSubmission && (
                            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-500/30 dark:bg-blue-500/10">
                                <h4 className="mb-3 font-bold tracking-tight text-blue-900 dark:text-blue-300">Submission Preview</h4>
                                <div className="grid grid-cols-2 gap-y-3 text-sm">
                                    <div>
                                        <span className="font-semibold text-blue-700 dark:text-blue-400">Team:</span>{" "}
                                        <span className="font-medium text-slate-900 dark:text-white">{selectedSubmission.teamName || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-blue-700 dark:text-blue-400">Title:</span>{" "}
                                        <span className="font-medium text-slate-900 dark:text-white">{selectedSubmission.projectTitle || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-blue-700 dark:text-blue-400">Status:</span>{" "}
                                        <span className="font-medium text-slate-900 dark:text-white">{selectedSubmission.status}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-blue-700 dark:text-blue-400">Track:</span>{" "}
                                        <span className="font-medium text-slate-900 dark:text-white">{selectedSubmission.trackName || "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!selectedSubmission && selectedSubmissionId && (
                            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                                Submission selected. View details below if available.
                            </div>
                        )}
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Section 3: Schedule</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                        <TextField
                            label="Start Time"
                            type="datetime-local"
                            fullWidth
                            {...register("startAt")}
                            disabled={isReadOnly}
                            error={!!errors.startAt}
                            helperText={errors.startAt?.message as string}
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={dateTimeFieldSx}
                        />
                        <TextField
                            label="End Time"
                            type="datetime-local"
                            fullWidth
                            {...register("endAt")}
                            disabled={isReadOnly}
                            error={!!errors.endAt}
                            helperText={errors.endAt?.message as string}
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={dateTimeFieldSx}
                        />
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Section 4: Benchmark Score Matrix</h2>
                    </div>
                    <div className="p-6">
                        {selectedSubmissionId ? (
                            <BenchmarkScoreMatrix criteria={criteria} />
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                                Please select a sample submission to view the scoring matrix.
                            </div>
                        )}
                        {errors.benchmarkScores && (
                            <p className="mt-3 text-center text-sm font-bold text-rose-600">Please ensure all benchmark scores are valid.</p>
                        )}
                    </div>
                </section>

                {!isReadOnly && (
                    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-4 border-t border-slate-200 bg-white/80 p-4 pr-10 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/80">
                        <Button onClick={() => window.history.back()} sx={{ fontWeight: 800, textTransform: "none" }}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isLoading || !selectedSubmissionId}
                            startIcon={<SaveOutlinedIcon />}
                            sx={{
                                borderRadius: "10px",
                                textTransform: "none",
                                fontWeight: 800,
                                bgcolor: "#059669",
                                "&:hover": { bgcolor: "#047857" },
                                px: 4,
                            }}
                        >
                            {isLoading ? "Saving..." : "Save Calibration Round"}
                        </Button>
                    </div>
                )}
            </form>
        </FormProvider>
    );
};