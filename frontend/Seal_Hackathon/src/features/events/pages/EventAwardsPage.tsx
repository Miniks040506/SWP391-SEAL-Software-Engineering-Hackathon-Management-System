import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import { Link, useParams } from "react-router-dom";

import { PublicEventAwardsSection } from "../components/PublicEventAwardsSection";
import { usePublicEventDetailQuery } from "../hooks/usePublicEventQueries";

export const EventAwardsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading } = usePublicEventDetailQuery(eventId);

  if (!eventId) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Event ID is required.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-28 max-w-2xl animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-5 md:grid-cols-2">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Event not found.
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-64px)] bg-[#f4f6f8] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to={`/events/${eventId}`}
            className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-blue-600 focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ArrowBackOutlinedIcon
              className="transition-transform group-hover:-translate-x-1"
              style={{ fontSize: 18 }}
            />
            Back to event
          </Link>

          <Link
            to={`/events/${eventId}/leaderboard`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:translate-y-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-300"
          >
            <LeaderboardOutlinedIcon style={{ fontSize: 18 }} />
            View leaderboard
          </Link>
        </div>

        <header className="relative mt-12 overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-6 py-10 shadow-[0_18px_60px_rgba(30,41,59,0.08)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none md:px-10 md:py-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-100/70 blur-3xl dark:bg-blue-500/10" />
          <div className="relative max-w-3xl">
            <div className="flex items-center gap-3 text-sm font-bold text-blue-600 dark:text-blue-400">
              <EmojiEventsOutlinedIcon style={{ fontSize: 20 }} />
              Final results
            </div>
            <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-[-0.04em] text-slate-950 [text-wrap:balance] dark:text-white md:text-6xl">
              {event.name} awards
            </h1>
            <p className="mt-5 max-w-[60ch] text-base leading-7 text-slate-500 dark:text-slate-400">
              Official prizes and winning teams from this event, collected in
              one place.
            </p>
          </div>
        </header>

        <section className="mt-10" aria-labelledby="awards-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2
                id="awards-heading"
                className="text-2xl font-black tracking-tight text-slate-950 dark:text-white"
              >
                Awarded teams
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Recognizing the teams who stood out across the final evaluation.
              </p>
            </div>
          </div>
          <PublicEventAwardsSection eventId={eventId} />
        </section>
      </div>
    </main>
  );
};
