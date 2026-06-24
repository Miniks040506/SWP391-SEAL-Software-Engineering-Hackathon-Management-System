import React from "react";


interface CalibrationStatusBadgeProps {
    distributionPublished: boolean;
    mandatory?: boolean;
}


export const CalibrationStatusBadge = ({
    distributionPublished,
    mandatory,
}: CalibrationStatusBadgeProps) => {
    return (
        <div className="flex items-center gap-2">
            {distributionPublished ? (
                <span className="px-2.5 py-1 rounded text-xs font-bold tracking-tight shadow-sm text-green-600 bg-green-50 border border-green-100">
                    PUBLISHED
                </span>
            ) : (
                <span className="px-2.5 py-1 rounded text-xs font-bold tracking-tight shadow-sm text-amber-600 bg-amber-50 border border-amber-100">
                    DRAFT
                </span>
            )}


            {mandatory && (
                <span className="px-2.5 py-1 rounded text-xs font-bold tracking-tight shadow-sm text-red-600 bg-red-50 border border-red-100">
                    MANDATORY
                </span>
            )}
        </div>
    );
};
