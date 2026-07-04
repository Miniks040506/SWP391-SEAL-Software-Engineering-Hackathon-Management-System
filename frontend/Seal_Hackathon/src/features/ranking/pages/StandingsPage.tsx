import { Link } from "react-router-dom";
import { CircularProgress, Button } from "@mui/material";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import { usePublicEventsQuery } from "@/features/events/hooks/usePublicEventQueries";

export const StandingsPage = () => {
    const { data: eventsPage, isLoading } = usePublicEventsQuery({ page: 0, size: 50 });
    const events = eventsPage?.content || [];

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <EmojiEventsOutlinedIcon sx={{ fontSize: 32 }} />
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                    Event Standings
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                    View official leaderboards and final rankings for all participating teams across our hackathons and competitions.
                </p>
            </div>

            {isLoading ? (
                <div className="flex min-h-[30vh] items-center justify-center">
                    <CircularProgress />
                </div>
            ) : events.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center dark:border-slate-800 dark:bg-slate-900/50">
                    <p className="text-lg font-medium text-slate-500">No events found.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                        {event.season} {event.year}
                                    </span>
                                    <span className="text-xs font-medium text-slate-500">
                                        {event.status === "ENDED" ? "Completed" : "Active"}
                                    </span>
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                                    {event.name}
                                </h3>
                                <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                                    Official leaderboard for {event.name}.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Button
                                    component={Link}
                                    to={`/events/${event.id}/leaderboard`}
                                    variant="text"
                                    color="primary"
                                    endIcon={<ArrowForwardOutlinedIcon />}
                                    fullWidth
                                    sx={{ fontWeight: 700, textTransform: "none", justifyContent: "space-between" }}
                                >
                                    View Leaderboard
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
