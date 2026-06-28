import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";


export const LeaderboardEmptyState = () => {
    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 py-24 text-center dark:border-slate-800 dark:bg-slate-900/50">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <EmojiEventsOutlinedIcon sx={{ fontSize: 40 }} />
            </div>
            <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
                Results are not published yet
            </h2>
            <p className="max-w-md text-slate-600 dark:text-slate-400">
                Please check again after the coordinator publishes final results. Good luck to all participating teams!
            </p>
        </div>
    );
};
