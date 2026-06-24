import React, { useEffect, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BenchmarkScoreMatrix } from "./BenchmarkScoreMatrix";
import type { EventCriteriaResponse } from "@/types/criteria.types";
import type { SubmissionSummaryResponse, CoordinatorSubmissionSummaryResponse } from "@/types/submission.types";
import type { RoundResponse } from "@/types/round.types";
import { format, parseISO } from "date-fns";


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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Section 1: Basic Information */}
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                        <p className="text-sm text-gray-500">
                            Calibration scores are used only for judge alignment, not final ranking.
                        </p>
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description / Name
                        </label>
                        <input
                            type="text"
                            {...register("description")}
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            placeholder="e.g. Preliminary Calibration Round 1"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>


                    <div className="flex items-start gap-2">
                        <input
                            type="checkbox"
                            {...register("mandatory")}
                            disabled={isReadOnly}
                            id="mandatory-checkbox"
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        <label htmlFor="mandatory-checkbox" className="text-sm text-gray-700">
                            <span className="font-medium block">Mandatory for judges</span>
                            <span className="text-gray-500">
                                Judges must complete this calibration before they can grade real submissions in the event.
                            </span>
                        </label>
                    </div>
                </div>


                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Sample Submission</h3>
                        <p className="text-sm text-gray-500">
                            Select a submission from a round to be used as the benchmark reference.
                        </p>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Round
                            </label>
                            <select
                                {...register("roundId")}
                                disabled={isReadOnly}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">Select a round</option>
                                {rounds.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                            {errors.roundId && (
                                <p className="mt-1 text-sm text-red-600">{errors.roundId.message}</p>
                            )}
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Submission
                            </label>
                            <select
                                {...register("sampleSubmissionId")}
                                disabled={isReadOnly || !selectedRoundId}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">Select a submission</option>
                                {submissions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.teamName || `Team ID: ${s.teamId}`} - {s.projectTitle || "Untitled"}
                                    </option>
                                ))}
                            </select>
                            {errors.sampleSubmissionId && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.sampleSubmissionId.message}
                                </p>
                            )}
                        </div>
                    </div>


                    {selectedSubmission && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100">
                            <h4 className="font-medium text-blue-900 mb-2">Submission Preview</h4>
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <div>
                                    <span className="text-blue-700 font-medium">Team:</span>{" "}
                                    {selectedSubmission.teamName || "N/A"}
                                </div>
                                <div>
                                    <span className="text-blue-700 font-medium">Title:</span>{" "}
                                    {selectedSubmission.projectTitle || "N/A"}
                                </div>
                                <div>
                                    <span className="text-blue-700 font-medium">Status:</span>{" "}
                                    {selectedSubmission.status}
                                </div>
                                <div>
                                    <span className="text-blue-700 font-medium">Track:</span>{" "}
                                    {selectedSubmission.trackName || "N/A"}
                                </div>
                            </div>
                        </div>
                    )}
                    {!selectedSubmission && selectedSubmissionId && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-500">
                            Submission selected. View details below if available.
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
                        <p className="text-sm text-gray-500">
                            Set the active period for judges to submit their calibration scores.
                        </p>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time
                            </label>
                            <input
                                type="datetime-local"
                                {...register("startAt")}
                                disabled={isReadOnly}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                            {errors.startAt && (
                                <p className="mt-1 text-sm text-red-600">{errors.startAt.message}</p>
                            )}
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                {...register("endAt")}
                                disabled={isReadOnly}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                            {errors.endAt && (
                                <p className="mt-1 text-sm text-red-600">{errors.endAt.message}</p>
                            )}
                        </div>
                    </div>
                </div>


                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Benchmark Score Matrix</h3>
                            <p className="text-sm text-gray-500">
                                Enter the ideal benchmark scores for the selected submission.
                            </p>
                        </div>
                    </div>


                    {selectedSubmissionId ? (
                        <BenchmarkScoreMatrix criteria={criteria} />
                    ) : (
                        <div className="p-8 text-center bg-gray-50 rounded border border-dashed border-gray-300 text-gray-500">
                            Please select a sample submission to view the scoring matrix.
                        </div>
                    )}
                    {errors.benchmarkScores && (
                        <p className="mt-1 text-sm text-red-600 text-center">Please ensure all benchmark scores are valid.</p>
                    )}
                </div>


                {!isReadOnly && (
                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !selectedSubmissionId}
                            className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center gap-2"
                        >
                            {isLoading && (
                                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            )}
                            Save Calibration Round
                        </button>
                    </div>
                )}
            </form>
        </FormProvider>
    );
};



