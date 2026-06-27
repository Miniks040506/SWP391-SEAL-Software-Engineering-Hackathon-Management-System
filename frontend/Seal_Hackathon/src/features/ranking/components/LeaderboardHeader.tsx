interface LeaderboardHeaderProps {
    eventName: string;
    title: string;
    publishedDate?: string | null;
}

export const LeaderboardHeader = ({
    eventName,
    title,
    publishedDate,
}: LeaderboardHeaderProps) => {
    return (
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2">
                <span className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {eventName}
                </span>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                    {title}
                </h1>
                {publishedDate ? (
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Published on {new Date(publishedDate).toLocaleDateString()}
                    </div>
                ) : (
                    <div className="text-sm font-medium italic text-orange-500">
                        Results are currently unpublished
                    </div>
                )}
            </div>
        </div>
    );
};
