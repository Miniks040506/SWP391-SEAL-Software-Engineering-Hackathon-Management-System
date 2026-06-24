import React from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import type { CalibrationRoundResponse } from "@/types/calibration.types";
import { CalibrationStatusBadge } from "./CalibrationStatusBadge";


interface CalibrationRoundTableProps {
    rounds: CalibrationRoundResponse[];
    onPublish: (id: string) => void;
    isPublishing: string | null;
}


const formatDate = (isoString?: string | null) => {
    if (!isoString) return "N/A";
    try {
        return format(parseISO(isoString), "MMM d, yyyy HH:mm");
    } catch {
        return "Invalid Date";
    }
};


export const CalibrationRoundTable = ({
    rounds,
    onPublish,
    isPublishing,
}: CalibrationRoundTableProps) => {
    if (!rounds || rounds.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
                No calibration rounds found. Create one to get started.
            </div>
        );
    }


    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                        <tr>
                            <th className="py-3 px-4">Name / Description</th>
                            <th className="py-3 px-4">Sample / Team</th>
                            <th className="py-3 px-4">Start Time</th>
                            <th className="py-3 px-4">End Time</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                        {rounds.map((round) => {
                            const isDistributionPublished = !!round.distributionPublishedAt;


                            return (
                                <tr key={round.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-gray-900">
                                            {round.description || "Calibration Round"}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        {/* Without extra query, we just have sampleSubmissionId. We might need a generic lookup if we want team name, or we just display ID.
                        The API response 'CalibrationRoundResponse' does not include sample team name directly unless we enhance the response.
                        For now, we display the ID or 'View Details' */}
                                        <span className="text-gray-500 font-mono text-xs">
                                            Sub ID: {round.sampleSubmissionId.substring(0, 8)}...
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">{formatDate(round.startAt)}</td>
                                    <td className="py-3 px-4">{formatDate(round.endAt)}</td>
                                    <td className="py-3 px-4">
                                        <CalibrationStatusBadge
                                            distributionPublished={isDistributionPublished}
                                            mandatory={round.mandatory}
                                        />
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/coordinator/calibrations/${round.id}`}
                                                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                            >
                                                View
                                            </Link>


                                            {!isDistributionPublished && (
                                                <>
                                                    <span className="text-gray-300">|</span>
                                                    <Link
                                                        to={`/coordinator/calibrations/${round.id}/edit`}
                                                        className="text-amber-600 hover:text-amber-800 font-medium transition-colors"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <span className="text-gray-300">|</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => onPublish(round.id)}
                                                        disabled={isPublishing === round.id}
                                                        className="text-green-600 hover:text-green-800 font-medium transition-colors disabled:opacity-50"
                                                    >
                                                        {isPublishing === round.id ? "Publishing..." : "Publish Distribution"}
                                                    </button>
                                                </>
                                            )}


                                            {isDistributionPublished && (
                                                <>
                                                    <span className="text-gray-300">|</span>
                                                    <Link
                                                        to={`/coordinator/calibrations/${round.id}#distribution`}
                                                        className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                                                    >
                                                        Distribution
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};



