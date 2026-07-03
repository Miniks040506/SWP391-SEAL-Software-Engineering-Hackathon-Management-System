
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
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                    PUBLISHED
                </span>
            ) : (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    DRAFT
                </span>
            )}

            {mandatory && (
                <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-rose-600 shadow-sm dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
                    MANDATORY
                </span>
            )}
        </div>
    );
};
