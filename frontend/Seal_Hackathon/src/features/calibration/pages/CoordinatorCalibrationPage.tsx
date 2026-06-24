import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
    useEventCalibrationRoundsQuery,
    useAllCalibrationRoundsQuery,
} from "@/features/calibration/hooks/useCalibrationQueries";
import {
    usePublishCalibrationDistributionMutation,
} from "@/features/calibration/hooks/useCalibrationMutations";
import { CalibrationRoundTable } from "@/features/calibration/components/CalibrationRoundTable";


export const CoordinatorCalibrationPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const { enqueueSnackbar } = useSnackbar();

    const eventQuery = useEventCalibrationRoundsQuery(eventId);
    const allQuery = useAllCalibrationRoundsQuery();

    const {
        data: calibrationRounds,
        isLoading,
        isError,
    } = eventId ? eventQuery : allQuery;


    const publishMutation = usePublishCalibrationDistributionMutation();
    const [publishingId, setPublishingId] = useState<string | null>(null);


    const handlePublish = async (id: string) => {
        if (!window.confirm("Are you sure you want to publish the distribution? This action cannot be undone and will prevent further edits.")) {
            return;
        }


        setPublishingId(id);
        publishMutation.mutate(id, {
            onSuccess: () => {
                enqueueSnackbar("Distribution published successfully", { variant: "success" });
            },
            onError: (error: any) => {
                enqueueSnackbar(
                    error?.response?.data?.message || "Failed to publish distribution",
                    { variant: "error" }
                );
            },
            onSettled: () => {
                setPublishingId(null);
            },
        });
    };


    const totalRounds = calibrationRounds?.length || 0;
    const openRounds = calibrationRounds?.filter((r) => !r.distributionPublishedAt).length || 0;
    const publishedDistributions = calibrationRounds?.filter((r) => r.distributionPublishedAt).length || 0;
    const pendingJudgeSubmissions = 0;


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Calibration Rounds
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Setup benchmark scoring before real judging
                    </p>
                </div>
                {eventId && (
                    <div className="flex items-center gap-3">
                        <Link
                            to={`/coordinator/events/${eventId}/edit`}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Back to Event
                        </Link>
                        <Link
                            to={`/coordinator/events/${eventId}/calibrations/create`}
                            className="px-4 py-2 bg-blue-600 rounded-md text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Create Calibration Round
                        </Link>
                    </div>
                )}
            </div>


            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Total calibration rounds
                    </span>
                    <span className="text-3xl font-bold text-gray-900 mt-2">{totalRounds}</span>
                </div>
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Open calibration rounds
                    </span>
                    <span className="text-3xl font-bold text-blue-600 mt-2">{openRounds}</span>
                </div>
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Published distributions
                    </span>
                    <span className="text-3xl font-bold text-green-600 mt-2">{publishedDistributions}</span>
                </div>
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        Pending submissions
                    </span>
                    <span className="text-3xl font-bold text-amber-600 mt-2">{pendingJudgeSubmissions}</span>
                </div>
            </div>


            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    All Calibration Rounds
                </h2>
                {isLoading ? (
                    <div className="py-12 flex justify-center items-center">
                        <span className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></span>
                    </div>
                ) : isError ? (
                    <div className="py-12 text-center text-red-500">
                        Failed to load calibration rounds. Please try again.
                    </div>
                ) : (
                    <CalibrationRoundTable
                        rounds={calibrationRounds || []}
                        onPublish={handlePublish}
                        isPublishing={publishingId}
                    />
                )}
            </div>
        </div>
    );
};
