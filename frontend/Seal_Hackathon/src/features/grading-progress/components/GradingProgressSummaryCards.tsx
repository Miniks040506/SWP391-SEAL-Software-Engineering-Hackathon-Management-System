import { LinearProgress } from "@mui/material";

interface GradingProgressSummaryCardsProps {
    percent: number;
    totalAssignedSubmissions: number;
    completedAssignedSubmissions: number;
    pendingSubmissions: number;
    draftSavedSubmissions: number;
    lockedSubmissions: number;
}

export const GradingProgressSummaryCards = ({
    percent,
    totalAssignedSubmissions,
    completedAssignedSubmissions,
    pendingSubmissions,
    draftSavedSubmissions,
    lockedSubmissions,
}: GradingProgressSummaryCardsProps) => {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Progress</span>
                <span className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{percent}%</span>
                <div className="mt-3">
                    <LinearProgress variant="determinate" value={percent} />
                </div>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Assigned</span>
                <span className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{totalAssignedSubmissions}</span>
                <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">Total pairs</span>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm dark:border-emerald-900 dark:bg-emerald-900/20">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Completed</span>
                <span className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">{completedAssignedSubmissions}</span>
                <span className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Fully submitted</span>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending</span>
                <span className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{pendingSubmissions}</span>
                <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">Not started</span>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm dark:border-blue-900 dark:bg-blue-900/20">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Drafts</span>
                <span className="mt-1 text-2xl font-black text-blue-700 dark:text-blue-300">{draftSavedSubmissions}</span>
                <span className="mt-1 text-xs text-blue-600 dark:text-blue-400">In progress</span>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-purple-200 bg-purple-50 p-5 shadow-sm dark:border-purple-900 dark:bg-purple-900/20">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Locked</span>
                <span className="mt-1 text-2xl font-black text-purple-700 dark:text-purple-300">{lockedSubmissions}</span>
                <span className="mt-1 text-xs text-purple-600 dark:text-purple-400">Scores frozen</span>
            </div>
        </div>
    );
};
