import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import { Button, MenuItem, Switch, TextField } from "@mui/material";

import { BenchmarkScoreMatrix } from "./BenchmarkScoreMatrix";
import { ActionConfirmDialog } from "@/components/common/ActionConfirmDialog";
import type { EventCriteriaResponse } from "@/types/criteria.types";
import type { SubmissionSummaryResponse, CoordinatorSubmissionSummaryResponse } from "@/types/submission.types";
import type { RoundResponse } from "@/types/round.types";
import { CALIB } from "../../constants/calibrationUi";
import { formatDuration } from "../../utils/format";

const createCalibrationFormSchema = (criteria: EventCriteriaResponse[]) => z.object({
    description: z.string().optional(),
    mandatory: z.boolean(),
    roundId: z.string().min(1, "Round is required"),
    sampleSubmissionId: z.string().min(1, "Sample submission is required"),
    startAt: z.string().min(1, "Start time is required"),
    endAt: z.string().min(1, "End time is required"),
    benchmarkScores: z.object(
        Object.fromEntries(
            criteria.map((criterion) => [
                criterion.id,
                z.number({ error: "Benchmark score is required" })
                    .min(0, "Benchmark score must be at least 0")
                    .max(
                        criterion.effectiveMaxScore,
                        `Benchmark score must not exceed ${criterion.effectiveMaxScore}`
                    ),
            ])
        )
    ),
}).refine((data) => {
    if (data.startAt && data.endAt) {
        return new Date(data.endAt) > new Date(data.startAt);
    }
    return true;
}, {
    message: "End time must be after start time",
    path: ["endAt"],
});

export type CalibrationFormValues = z.infer<ReturnType<typeof createCalibrationFormSchema>>;

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
    } catch {
        return "";
    }
};

const textFieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "10px" } };
const dateTimeFieldSx = {
    "& .MuiOutlinedInput-root": { borderRadius: "10px" },
    "& .MuiInputLabel-root": { backgroundColor: "white", paddingInline: "4px" },
    ".dark & .MuiInputLabel-root": { backgroundColor: "#0f172a" },
};

const StepHeading = ({
    step,
    title,
    subtitle,
    icon,
}: {
    step: number;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
}) => (
    <div className="flex items-center gap-3.5 border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${CALIB.gradient} ${CALIB.glow}`}>
            {icon}
        </span>
        <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                Step {step}
            </p>
            <h2 className="text-base font-black text-slate-900 dark:text-white">{title}</h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
    </div>
);

/** Mini stepper shown while no submission has been picked yet. */
const BenchmarkPlaceholder = () => {
    const steps = [
        { label: "Pick a round", icon: <FlagOutlinedIcon sx={{ fontSize: 16 }} /> },
        { label: "Pick a sample submission", icon: <RuleOutlinedIcon sx={{ fontSize: 16 }} /> },
        { label: "Enter benchmark scores", icon: <EditNoteOutlinedIcon sx={{ fontSize: 16 }} /> },
    ];
    return (
        <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                The benchmark matrix unlocks once a sample submission is selected.
            </p>
            <ol className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-2">
                {steps.map((step, index) => (
                    <li key={step.label} className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                            {step.icon}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{step.label}</span>
                        {index < steps.length - 1 && (
                            <span className="mx-1 hidden text-slate-300 sm:inline dark:text-slate-600">→</span>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
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
    const validationSchema = useMemo(
        () => createCalibrationFormSchema(criteria),
        [criteria]
    );
    const methods = useForm<CalibrationFormValues>({
        resolver: zodResolver(validationSchema),
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
        setValue,
        formState: { errors, isDirty },
    } = methods;

    const selectedRoundId = watch("roundId");
    const selectedSubmissionId = watch("sampleSubmissionId");
    const startAt = watch("startAt");
    const endAt = watch("endAt");
    const mandatory = watch("mandatory");

    // Round switching goes through a confirm dialog when it would wipe entered data.
    const [pendingRoundId, setPendingRoundId] = useState<string | null>(null);
    const initialNotifiedRef = useRef(false);

    useEffect(() => {
        // Notify the parent once for a pre-selected round (edit mode) so submissions load.
        if (selectedRoundId && !initialNotifiedRef.current) {
            initialNotifiedRef.current = true;
            onRoundChange(selectedRoundId);
        }
    }, [selectedRoundId, onRoundChange]);

    const applyRound = (roundId: string) => {
        setValue("roundId", roundId, { shouldDirty: true, shouldValidate: true });
        setValue("sampleSubmissionId", "", { shouldDirty: true });
        setValue("benchmarkScores", {}, { shouldDirty: true });
        if (roundId) onRoundChange(roundId);
    };

    const handleRoundSelect = (nextRoundId: string) => {
        if (nextRoundId === selectedRoundId) return;
        const scores = methods.getValues("benchmarkScores") ?? {};
        const hasEnteredData =
            !!selectedSubmissionId ||
            Object.values(scores).some((v) => typeof v === "number" && !Number.isNaN(v));
        if (selectedRoundId && hasEnteredData) {
            setPendingRoundId(nextRoundId);
        } else {
            applyRound(nextRoundId);
        }
    };

    const selectedSubmission = useMemo(() => {
        return submissions.find((s) => s.id === selectedSubmissionId);
    }, [submissions, selectedSubmissionId]);

    const duration = formatDuration(
        startAt ? new Date(startAt).toISOString() : null,
        endAt ? new Date(endAt).toISOString() : null,
    );

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1 — Basic information */}
                <section
                    className="calib-fade-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    style={{ "--calib-stagger": 1 } as React.CSSProperties}
                >
                    <StepHeading
                        step={1}
                        title="Basic information"
                        subtitle="Name the calibration and decide whether judges must complete it."
                        icon={<EditNoteOutlinedIcon sx={{ fontSize: 19 }} />}
                    />
                    <div className="space-y-5 p-6">
                        <TextField
                            label="Description / Name"
                            fullWidth
                            {...register("description")}
                            disabled={isReadOnly}
                            error={!!errors.description}
                            helperText={
                                (errors.description?.message as string) ||
                                "Shown to judges in their calibration task list."
                            }
                            sx={textFieldSx}
                        />
                        <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => setValue("mandatory", !mandatory, { shouldDirty: true })}
                            className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 text-left transition ${
                                mandatory
                                    ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-500/40 dark:bg-emerald-500/10"
                                    : "border-slate-200 bg-slate-50/60 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/40"
                            }`}
                        >
                            <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white">
                                    Mandatory before real grading
                                </p>
                                <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Judges must submit calibration scores before they can grade real submissions.
                                </p>
                            </div>
                            <Switch
                                checked={mandatory}
                                disabled={isReadOnly}
                                onChange={(e) => setValue("mandatory", e.target.checked, { shouldDirty: true })}
                                onClick={(e) => e.stopPropagation()}
                                color="success"
                                slotProps={{ input: { "aria-label": "Mandatory before real grading" } }}
                            />
                        </button>
                    </div>
                </section>

                {/* Step 2 — Sample submission */}
                <section
                    className="calib-fade-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    style={{ "--calib-stagger": 2 } as React.CSSProperties}
                >
                    <StepHeading
                        step={2}
                        title="Sample submission"
                        subtitle="Choose the round and the submission every judge will score."
                        icon={<RuleOutlinedIcon sx={{ fontSize: 19 }} />}
                    />
                    <div className="space-y-5 p-6">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <TextField
                                select
                                label="Round"
                                fullWidth
                                value={selectedRoundId || ""}
                                onChange={(e) => handleRoundSelect(e.target.value)}
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
                                value={selectedSubmissionId || ""}
                                disabled={isReadOnly || !selectedRoundId}
                                error={!!errors.sampleSubmissionId}
                                helperText={errors.sampleSubmissionId?.message as string}
                                sx={textFieldSx}
                            >
                                <MenuItem value="">Select a submission</MenuItem>
                                {submissions.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>
                                        {s.teamName || `Team ID: ${s.teamId}`} - Submission #{s.submissionNumber}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </div>

                        {selectedSubmission && (
                            <div className={`rounded-xl border p-5 ${CALIB.softSurface}`}>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                                    Selected sample
                                </p>
                                <p className="mt-1.5 text-lg font-black text-slate-900 dark:text-white">
                                    {selectedSubmission.teamName || "Unnamed team"}
                                </p>
                                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                    {selectedSubmission.roundName && (
                                        <span className="rounded-md bg-white/80 px-2 py-1 text-xs font-bold text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                                            {selectedSubmission.roundName}
                                        </span>
                                    )}
                                    {selectedSubmission.trackName && (
                                        <span className="rounded-md bg-white/80 px-2 py-1 text-xs font-bold text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                                            {selectedSubmission.trackName}
                                        </span>
                                    )}
                                    <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                        {selectedSubmission.status}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Step 3 — Schedule */}
                <section
                    className="calib-fade-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    style={{ "--calib-stagger": 3 } as React.CSSProperties}
                >
                    <StepHeading
                        step={3}
                        title="Schedule"
                        subtitle="Define the scoring window judges can submit within."
                        icon={<FlagOutlinedIcon sx={{ fontSize: 19 }} />}
                    />
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                        {duration && (
                            <p className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                                Window duration:{" "}
                                <span className="text-emerald-600 dark:text-emerald-400">{duration}</span>
                            </p>
                        )}
                    </div>
                </section>

                {/* Step 4 — Benchmark scores */}
                <section
                    className="calib-fade-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    style={{ "--calib-stagger": 4 } as React.CSSProperties}
                >
                    <StepHeading
                        step={4}
                        title="Benchmark scores"
                        subtitle="The reference scores judges will be compared against."
                        icon={<SaveOutlinedIcon sx={{ fontSize: 19 }} />}
                    />
                    <div className="p-6">
                        {selectedSubmissionId ? (
                            <BenchmarkScoreMatrix criteria={criteria} disabled={isReadOnly} />
                        ) : (
                            <BenchmarkPlaceholder />
                        )}
                        {errors.benchmarkScores && (
                            <p className="mt-3 text-center text-sm font-bold text-rose-600">
                                Please ensure all benchmark scores are valid.
                            </p>
                        )}
                    </div>
                </section>

                {/* Sticky action bar — sticky inside the content column, not viewport-fixed */}
                {!isReadOnly && (
                    <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-lg backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/85">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {isDirty ? (
                                <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                    Unsaved changes
                                </span>
                            ) : (
                                "No changes yet"
                            )}
                        </p>
                        <div className="flex items-center gap-3">
                            <Button onClick={() => window.history.back()} sx={{ fontWeight: 800, textTransform: "none" }}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isLoading || !selectedSubmissionId || criteria.length === 0}
                                startIcon={<SaveOutlinedIcon />}
                                className="calib-press"
                                sx={{
                                    borderRadius: "12px",
                                    textTransform: "none",
                                    fontWeight: 800,
                                    px: 4,
                                    background: "linear-gradient(135deg, #10b981, #14b8a6)",
                                    "&:hover": { background: "linear-gradient(135deg, #059669, #0d9488)" },
                                    "&.Mui-disabled": { background: "#e2e8f0" },
                                }}
                            >
                                {isLoading ? "Saving…" : "Save Calibration Round"}
                            </Button>
                        </div>
                    </div>
                )}
            </form>

            <ActionConfirmDialog
                open={pendingRoundId !== null}
                title="Change source round?"
                description="Switching the round clears the selected sample submission and every benchmark score you have entered."
                confirmLabel="Change round"
                onClose={() => setPendingRoundId(null)}
                onConfirm={() => {
                    if (pendingRoundId) applyRound(pendingRoundId);
                    setPendingRoundId(null);
                }}
                isPending={false}
            />
        </FormProvider>
    );
};
