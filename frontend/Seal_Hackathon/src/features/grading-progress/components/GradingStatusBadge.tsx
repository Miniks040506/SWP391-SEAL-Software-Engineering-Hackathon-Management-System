import type { JudgeGradingStatus } from "@/types/grading.types";

interface GradingStatusBadgeProps {
    status: JudgeGradingStatus;
}

export const GradingStatusBadge = ({ status }: GradingStatusBadgeProps) => {
    let label = "Unknown";
    let twColor = "";

    switch (status) {
        case "PENDING":
            label = "Not started";
            twColor = "text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800";
            break;
        case "DRAFT_SAVED":
            label = "Draft saved";
            twColor = "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30";
            break;
        case "SUBMITTED":
        case "COMPLETED":
            label = "Submitted";
            twColor = "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30";
            break;
        case "LOCKED":
            label = "Locked";
            twColor = "text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/30";
            break;
        default:
            break;
    }

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${twColor}`}
        >
            {label}
        </span>
    );
};
