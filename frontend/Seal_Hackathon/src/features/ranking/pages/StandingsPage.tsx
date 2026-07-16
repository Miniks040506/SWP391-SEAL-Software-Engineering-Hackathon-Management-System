import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";

import { usePublicEventsQuery } from "@/features/events/hooks/usePublicEventQueries";
import { usePublicEventLeaderboardQuery } from "@/features/ranking/hooks/useRankingQueries";
import {
  formatShortDate,
  getSeasonLabel,
  isCompletedEvent,
  isJudgingEvent,
  isOngoingEvent,
} from "@/features/events/utils/publicEventView";
import type { EventSummaryResponse } from "@/types/event.types";

/* ------------------------------------------------------------------ */
/* Scroll reveal (mirrors the landing page pattern)                     */
/* ------------------------------------------------------------------ */

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={[
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Result state per event                                              */
/* ------------------------------------------------------------------ */

type ResultState = "final" | "live" | "upcoming";

function getResultState(status?: string | null): ResultState {
  if (isCompletedEvent(status)) return "final";
  if (isOngoingEvent(status) || isJudgingEvent(status)) return "live";
  return "upcoming";
}

const resultStateChip: Record<
  ResultState,
  { label: string; className: string; dot: string }
> = {
  final: {
    label: "Results final",
    className:
      "border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  live: {
    label: "Season live",
    className:
      "border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  upcoming: {
    label: "Upcoming",
    className:
      "border-gray-200 bg-gray-50 text-gray-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400",
    dot: "bg-gray-400 dark:bg-slate-500",
  },
};

/* ------------------------------------------------------------------ */
/* Event banner with graceful fallback                                  */
/* ------------------------------------------------------------------ */

function EventBanner({
  event,
  className = "",
}: {
  event: EventSummaryResponse;
  className?: string;
}) {
  const [bannerFailed, setBannerFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const bannerSrc =
    event.bannerUrl && !bannerFailed
      ? event.bannerUrl
      : `https://picsum.photos/seed/seal-event-${event.id}/640/280`;

  if (fallbackFailed) {
    return (
      <div
        className={`flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-sky-50 dark:from-blue-500/15 dark:via-slate-900 dark:to-slate-900 ${className}`}
      >
        <ImageOutlinedIcon
          className="text-blue-200 dark:text-blue-500/30"
          style={{ fontSize: 40 }}
        />
      </div>
    );
  }

  return (
    <img
      src={bannerSrc}
      alt={`${event.name} banner`}
      loading="lazy"
      onError={() =>
        bannerSrc === event.bannerUrl
          ? setBannerFailed(true)
          : setFallbackFailed(true)
      }
      className={`object-cover ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Standings card                                                       */
/* ------------------------------------------------------------------ */

function StandingsCard({
  event,
  onOpen,
}: {
  event: EventSummaryResponse;
  onOpen: (event: EventSummaryResponse) => void;
}) {
  const state = getResultState(event.status);
  const chip = resultStateChip[state];

  return (
    <button
      type="button"
      onClick={() => onOpen(event)}
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left transition-all hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/60 motion-reduce:hover:translate-y-0"
    >
      <div className="relative h-36 w-full overflow-hidden">
        <EventBanner
          event={event}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-transparent"
        />
        <span
          className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur-sm ${chip.className}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${chip.dot}`} />
          {chip.label}
        </span>
        <span className="absolute bottom-3 left-4 text-xs font-bold uppercase tracking-widest text-white/90 drop-shadow">
          {getSeasonLabel(event.season, event.year)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {event.name}
        </h3>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
          <CalendarMonthOutlinedIcon style={{ fontSize: 15 }} />
          {formatShortDate(event.competitionStartAt)} —{" "}
          {formatShortDate(event.competitionEndAt)}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 dark:border-slate-800">
          <span className="text-xs font-semibold text-gray-400 dark:text-slate-500">
            {state === "final"
              ? "Final rankings published"
              : state === "live"
                ? "Rankings publish per round"
                : "Results appear here after judging"}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-transform group-hover:translate-x-1 dark:text-blue-400 motion-reduce:group-hover:translate-x-0">
            Leaderboard
            <ArrowForwardRoundedIcon style={{ fontSize: 16 }} />
          </span>
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export const StandingsPage = () => {
  const navigate = useNavigate();

  const eventsQuery = usePublicEventsQuery({ page: 0, size: 50 });
  const events = useMemo(
    () => eventsQuery.data?.content ?? [],
    [eventsQuery.data],
  );

  const spotlightEvent = useMemo(() => {
    const completed = events.filter((event) => isCompletedEvent(event.status));
    return [...completed].sort((a, b) =>
      (b.competitionEndAt ?? "").localeCompare(a.competitionEndAt ?? ""),
    )[0];
  }, [events]);

  const leaderboardQuery = usePublicEventLeaderboardQuery(spotlightEvent?.id);

  // Leaderboard rows are ranked per track/round, so dedupe teams and
  // order by score for the preview — same rule the landing page uses.
  const spotlightRows = useMemo(() => {
    const sorted = [...(leaderboardQuery.data ?? [])].sort(
      (a, b) => b.totalScore - a.totalScore,
    );
    const seenTeams = new Set<string>();
    return sorted
      .filter((row) => {
        if (seenTeams.has(row.teamId)) return false;
        seenTeams.add(row.teamId);
        return true;
      })
      .slice(0, 5);
  }, [leaderboardQuery.data]);

  const spotlightLoading = eventsQuery.isLoading || leaderboardQuery.isLoading;

  const eventsByYear = useMemo(() => {
    const groups = new Map<number, EventSummaryResponse[]>();
    for (const event of events) {
      const list = groups.get(event.year) ?? [];
      list.push(event);
      groups.set(event.year, list);
    }
    return [...groups.entries()].sort(([a], [b]) => b - a);
  }, [events]);

  const finalCount = events.filter((event) =>
    isCompletedEvent(event.status),
  ).length;

  const handleOpenLeaderboard = (event: EventSummaryResponse) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/events/${event.id}/leaderboard`);
  };

  return (
    <div className="animate-in space-y-16 fade-in duration-500 md:space-y-20">
      {/* ---------------------------------------------------------- */}
      {/* Hero                                                        */}
      {/* ---------------------------------------------------------- */}
      <section className="relative pt-2 md:pt-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-6 -top-16 bottom-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(59,130,246,0.10),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(59,130,246,0.16),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-6 -top-16 bottom-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)]"
        />

        <div className="relative mx-auto max-w-3xl space-y-6 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              <LeaderboardOutlinedIcon style={{ fontSize: 14 }} />
              SEAL League · Official results
            </span>
          </div>

          <h1 className="animate-in fade-in slide-in-from-bottom-3 text-4xl font-extrabold leading-[1.08] tracking-tight text-gray-900 duration-700 dark:text-white md:text-6xl">
            Every score,
            <br />
            <span className="bg-linear-to-r from-blue-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
              out in the open.
            </span>
          </h1>

          <p className="mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-3 text-lg leading-relaxed text-gray-500 duration-700 dark:text-slate-400">
            Official leaderboards for every SEAL season. Rankings are calculated
            from blind judge scores and published for everyone to see — teams,
            mentors, and the public alike.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-1 animate-in fade-in duration-1000">
            {[
              { value: String(events.length || "—"), label: "Seasons tracked" },
              { value: String(finalCount || "—"), label: "Results final" },
              { value: "100%", label: "Scores preserved" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold tabular-nums tracking-tight text-gray-900 dark:text-white">
                  {stat.value}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Spotlight: latest final standings                           */}
      {/* ---------------------------------------------------------- */}
      {(spotlightLoading || spotlightEvent) && (
        <section>
          <Reveal>
            <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-2">
              {/* Event side */}
              <div className="relative flex min-h-64 flex-col justify-end overflow-hidden p-8 md:p-10">
                {spotlightEvent && (
                  <>
                    <EventBanner
                      event={spotlightEvent}
                      className="absolute inset-0 h-full w-full"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/45 to-slate-950/15"
                    />
                  </>
                )}
                {!spotlightEvent && (
                  <div
                    aria-hidden
                    className="absolute inset-0 animate-pulse bg-gray-100 dark:bg-slate-800/70 motion-reduce:animate-none"
                  />
                )}

                <div className="relative space-y-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/30 backdrop-blur-sm">
                    <WorkspacePremiumOutlinedIcon style={{ fontSize: 13 }} />
                    Latest final standings
                  </span>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                    {spotlightEvent?.name ?? "Loading season…"}
                  </h2>
                  {spotlightEvent && (
                    <p className="text-sm font-semibold text-white/70">
                      {getSeasonLabel(
                        spotlightEvent.season,
                        spotlightEvent.year,
                      )}
                      {" · "}
                      {formatShortDate(
                        spotlightEvent.competitionStartAt,
                      )} — {formatShortDate(spotlightEvent.competitionEndAt)}
                    </p>
                  )}
                  {spotlightEvent && (
                    <Link
                      to={`/events/${spotlightEvent.id}/leaderboard`}
                      className="group mt-2 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50 active:translate-y-0.5"
                    >
                      View full leaderboard
                      <ArrowForwardRoundedIcon
                        style={{ fontSize: 16 }}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  )}
                </div>
              </div>

              {/* Top teams side */}
              <div className="flex flex-col gap-3 p-8 md:p-10">
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    <EmojiEventsOutlinedIcon style={{ fontSize: 15 }} />
                    Top teams
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-300 dark:text-slate-600">
                    <VisibilityOffOutlinedIcon style={{ fontSize: 13 }} />
                    Scored blind
                  </span>
                </div>

                {spotlightLoading &&
                  [1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-11 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-800/70 motion-reduce:animate-none"
                    />
                  ))}

                {!spotlightLoading && spotlightRows.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-xl bg-gray-50 px-6 py-10 text-center text-sm font-semibold text-gray-400 dark:bg-slate-800/60 dark:text-slate-500">
                    Results publish after each round — check back soon.
                  </div>
                )}

                {spotlightRows.map((row, index) => (
                  <div
                    key={row.id}
                    className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-2.5 dark:bg-slate-800/60"
                  >
                    <span
                      className={[
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold tabular-nums",
                        index === 0
                          ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                          : "bg-white text-gray-500 ring-1 ring-gray-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700",
                      ].join(" ")}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800 dark:text-slate-200">
                        {row.teamName}
                      </p>
                      {row.trackName && (
                        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                          {row.trackName}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-bold tabular-nums text-blue-600 dark:text-blue-400">
                      {row.totalScore.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* ---------------------------------------------------------- */}
      {/* All seasons, grouped by year                                */}
      {/* ---------------------------------------------------------- */}
      <section className="space-y-10">
        <Reveal className="max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <CalendarMonthOutlinedIcon style={{ fontSize: 18 }} />
            The competition years
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Pick a season, see the board
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-gray-500 dark:text-slate-400">
            Each season keeps its own leaderboard. Completed seasons show final
            rankings; live seasons update as each round is published.
          </p>
        </Reveal>

        {eventsQuery.isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl bg-gray-100 dark:bg-slate-800/70 motion-reduce:animate-none"
              />
            ))}
          </div>
        )}

        {eventsQuery.isError && (
          <div className="rounded-2xl border border-gray-200 bg-white py-14 text-center text-sm font-semibold text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            Standings are unavailable right now. Try again in a moment.
          </div>
        )}

        {!eventsQuery.isLoading &&
          !eventsQuery.isError &&
          events.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 py-20 text-center dark:border-slate-700 dark:bg-slate-900/50">
              <p className="text-base font-semibold text-gray-500 dark:text-slate-400">
                No seasons have been announced yet. Check back soon.
              </p>
            </div>
          )}

        {eventsByYear.map(([year, yearEvents], groupIndex) => (
          <Reveal key={year} delay={groupIndex * 80} className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="text-xl font-extrabold tabular-nums tracking-tight text-gray-900 dark:text-white">
                {year}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                {yearEvents.length} season{yearEvents.length > 1 ? "s" : ""}
              </span>
              <span
                aria-hidden
                className="h-px flex-1 bg-linear-to-r from-gray-200 to-transparent dark:from-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {yearEvents.map((event) => (
                <StandingsCard
                  key={event.id}
                  event={event}
                  onOpen={handleOpenLeaderboard}
                />
              ))}
            </div>
          </Reveal>
        ))}
      </section>
    </div>
  );
};
