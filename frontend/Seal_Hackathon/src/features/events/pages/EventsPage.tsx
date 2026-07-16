import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import Diversity3OutlinedIcon from "@mui/icons-material/Diversity3Outlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import { CircularProgress, Pagination } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { teamApi } from "@/api/team.api";
import { EventCard } from "@/features/events/components/EventCard";
import { usePublicEventsQuery } from "@/features/events/hooks/usePublicEventQueries";
import { usePublicEventLeaderboardQuery } from "@/features/ranking/hooks/useRankingQueries";
import {
  publicEventsFilterSchema,
  type PublicEventsFilterValues,
} from "@/features/events/schemas/publicEvent.schema";
import { useAuthStore } from "@/stores/authStore";
import { getPrimaryRole } from "@/utils/roleRedirect";
import type { EventSummaryResponse } from "@/types/event.types";

const seasons: PublicEventsFilterValues["season"][] = [
  "All",
  "SPRING",
  "SUMMER",
  "FALL",
];

const paginationSx = {
  "& .MuiPaginationItem-root": {
    borderColor: "#d1d5db",
    color: "#111827",
    backgroundColor: "#ffffff",
    fontWeight: 800,
  },

  "& .MuiPaginationItem-root:hover": {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
    color: "#2563eb",
  },

  "& .MuiPaginationItem-root.Mui-selected": {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
    color: "#ffffff",
    boxShadow: "0 8px 20px rgba(59, 130, 246, 0.25)",
  },

  "& .MuiPaginationItem-root.Mui-selected:hover": {
    backgroundColor: "#2563eb",
  },

  "& .MuiPaginationItem-root.Mui-disabled": {
    opacity: 1,
    borderColor: "#e5e7eb",
    color: "#9ca3af",
    backgroundColor: "#f9fafb",
  },

  ".dark & .MuiPaginationItem-root": {
    borderColor: "#334155",
    color: "#e5e7eb",
    backgroundColor: "#0f172a",
  },

  ".dark & .MuiPaginationItem-root:hover": {
    backgroundColor: "#1e293b",
    borderColor: "#60a5fa",
    color: "#93c5fd",
  },

  ".dark & .MuiPaginationItem-root.Mui-selected": {
    backgroundColor: "#3b82f6",
    borderColor: "#60a5fa",
    color: "#ffffff",
    boxShadow: "0 10px 24px rgba(59, 130, 246, 0.32)",
  },

  ".dark & .MuiPaginationItem-root.Mui-disabled": {
    opacity: 1,
    borderColor: "#1e293b",
    color: "#64748b",
    backgroundColor: "#020617",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Scroll reveal                                                        */
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
/* Static content                                                       */
/* ------------------------------------------------------------------ */

const heroStats = [
  { value: "3", label: "Seasons a year" },
  { value: "3–5", label: "Members per team" },
  { value: "2", label: "Judge panels" },
  { value: "100%", label: "Scores preserved" },
];

const seasonSteps = [
  {
    icon: HowToRegOutlinedIcon,
    title: "Register and verify",
    body: "Create an account with your university email. FPT and partner university students are welcome.",
  },
  {
    icon: GroupsOutlinedIcon,
    title: "Form a team of 3 to 5",
    body: "Start a team or join one with an invite code before registration closes.",
  },
  {
    icon: RocketLaunchOutlinedIcon,
    title: "Build and submit",
    body: "Ship your project each round before the submission lock. Mentors review your progress along the way.",
  },
  {
    icon: WorkspacePremiumOutlinedIcon,
    title: "Get judged and advance",
    body: "Internal and guest judges score every criterion. Top teams advance to the final and compete for prizes.",
  },
];

const roles = [
  {
    icon: SchoolOutlinedIcon,
    title: "Participants",
    body: "Compete in seasonal tracks, track your team's scores per criterion, and appeal results transparently.",
  },
  {
    icon: Diversity3OutlinedIcon,
    title: "Mentors",
    body: "Follow your assigned teams round by round and leave structured feedback on every submission.",
  },
  {
    icon: GavelOutlinedIcon,
    title: "Judges",
    body: "Grade blind against published criteria with calibration rounds that keep panels consistent.",
  },
  {
    icon: TuneOutlinedIcon,
    title: "Coordinators",
    body: "Configure events, lock rounds, publish results, and audit every sensitive action in one place.",
  },
];

const testimonials = [
  {
    quote:
      "The leaderboard updated the moment results were published, and we could see our score on every single criterion. No black box.",
    name: "Minh Anh",
    role: "Team Leader — Summer season",
    avatar: "https://picsum.photos/seed/seal-voice-1/96/96",
  },
  {
    quote:
      "Blind grading changed how I judge. I only see the work, never the team name, and the calibration round keeps the panel aligned.",
    name: "Dr. Thanh",
    role: "Internal Judge — SE Department",
    avatar: "https://picsum.photos/seed/seal-voice-2/96/96",
  },
  {
    quote:
      "As a mentor I get a live view of every team I'm assigned to. Feedback lands in the same place their submissions live.",
    name: "Quang Huy",
    role: "Mentor — Partner University",
    avatar: "https://picsum.photos/seed/seal-voice-3/96/96",
  },
];

const faqs = [
  {
    q: "Who can join a SEAL season?",
    a: "Students from FPT University HCM and partner universities. You register with your university email, verify it, and you are ready to form or join a team.",
  },
  {
    q: "How big does my team have to be?",
    a: "Teams have 3 to 5 members. You can create a team and invite classmates with an invite code, or request to join an existing team before registration closes.",
  },
  {
    q: "How is judging kept fair?",
    a: "Judges grade blind — they never see team names. Scoring criteria are published before the round starts, every individual score is recorded and preserved, and rankings are published per round for everyone to see.",
  },
  {
    q: "What happens between rounds?",
    a: "After grading is locked, rankings are calculated and advancement rules decide which teams move on. Your team sees its aggregated score per criterion for every round.",
  },
  {
    q: "Does it cost anything?",
    a: "No. SEAL is run by the Software Engineering Department & PDP at FPT University HCM. Competing is free for eligible students.",
  },
];

const scoreSheetRows = [
  { name: "Architecture", score: 9, max: 10 },
  { name: "Code quality", score: 8, max: 10 },
  { name: "Innovation", score: 9, max: 10 },
  { name: "Presentation", score: 7, max: 10 },
];

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export function EventsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () =>
      publicEventsFilterSchema.parse({
        season: searchParams.get("season") || "All",
        page: searchParams.get("page") || "1",
        size: searchParams.get("size") || "6",
      }),
    [searchParams],
  );

  const [activeSeason, setActiveSeason] = useState(filters.season);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const userRole = getPrimaryRole(user);
  const canFetchCompetitions =
    Boolean(accessToken) &&
    (userRole === "STUDENT" || userRole === "PARTICIPANT");

  const eventsQuery = usePublicEventsQuery({
    season: activeSeason === "All" ? undefined : activeSeason,
    page: filters.page - 1,
    size: filters.size,
  });

  const competitionsQuery = useQuery({
    queryKey: ["my-active-competitions"],
    queryFn: () => teamApi.getMyActiveCompetitions(),
    enabled: canFetchCompetitions,
    staleTime: 30_000,
  });

  const events = eventsQuery.data?.content ?? [];
  const pageCount = eventsQuery.data?.totalPages ?? 0;
  const competitionEventIds = new Set(
    (competitionsQuery.data ?? []).map((competition) => competition.eventId),
  );

  const completedEventsQuery = usePublicEventsQuery({
    status: "COMPLETED",
    page: 0,
    size: 12,
  });

  const latestCompletedEvent = useMemo(() => {
    const list = completedEventsQuery.data?.content ?? [];
    return [...list].sort((a, b) =>
      (b.competitionEndAt ?? "").localeCompare(a.competitionEndAt ?? ""),
    )[0];
  }, [completedEventsQuery.data]);

  const leaderboardQuery = usePublicEventLeaderboardQuery(
    latestCompletedEvent?.id,
  );

  // Event leaderboard rows are ranked per track/round, so rankPosition
  // repeats across tracks; order by score and show preview positions.
  const leaderboardRows = useMemo(() => {
    const sorted = [...(leaderboardQuery.data ?? [])].sort(
      (a, b) => b.totalScore - a.totalScore,
    );

    const seenTeams = new Set<string>();
    return sorted.filter((row) => {
      if (seenTeams.has(row.teamId)) return false;
      seenTeams.add(row.teamId);
      return true;
    });
  }, [leaderboardQuery.data]);

  const standingsLoading =
    completedEventsQuery.isLoading || leaderboardQuery.isLoading;

  useEffect(() => {
    if (!location.hash) return;

    window.setTimeout(() => {
      document
        .getElementById(location.hash.slice(1))
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [location.hash]);

  const handleSeasonChange = (season: PublicEventsFilterValues["season"]) => {
    setActiveSeason(season);

    setSearchParams((current) => {
      current.set("season", season);
      current.set("page", "1");
      return current;
    });
  };

  const handlePageChange = (page: number) => {
    setSearchParams((current) => {
      current.set("page", String(page));
      return current;
    });

    document
      .getElementById("schedule")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSelectEvent = (event: EventSummaryResponse) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/events/${event.id}`);
  };

  const handleGoCompeting = (event: EventSummaryResponse) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/events/${event.id}/competing`);
  };

  const scrollToSchedule = () => {
    document
      .getElementById("schedule")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="animate-in space-y-20 fade-in duration-500 md:space-y-24">
      {/* ---------------------------------------------------------- */}
      {/* Hero                                                        */}
      {/* ---------------------------------------------------------- */}
      <section
        id="dashboard"
        className="relative scroll-mt-24 pb-2 pt-2 md:pt-6"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-6 -top-16 bottom-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(59,130,246,0.10),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(59,130,246,0.16),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-6 -top-16 bottom-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)]"
        />

        <div className="relative grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
          <div className="space-y-7 lg:col-span-6">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
                FPT University HCM · SE Department & PDP
              </span>
            </div>

            <h1 className="animate-in fade-in slide-in-from-bottom-3 text-5xl font-extrabold leading-[1.05] tracking-tight text-gray-900 duration-700 dark:text-white md:text-6xl lg:text-7xl">
              The season
              <br />
              starts{" "}
              <span className="bg-linear-to-r from-blue-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                here.
              </span>
            </h1>

            <p className="max-w-md animate-in fade-in slide-in-from-bottom-3 text-lg leading-relaxed text-gray-500 duration-700 dark:text-slate-400">
              SEAL runs FPT's seasonal hackathons end to end — teams,
              submissions, blind judging, and public leaderboards. Build
              something worth judging.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 animate-in fade-in slide-in-from-bottom-3 duration-700">
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-blue-600/35 active:translate-y-0.5"
              >
                Start competing
                <ArrowForwardRoundedIcon
                  style={{ fontSize: 18 }}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>

              <button
                type="button"
                onClick={scrollToSchedule}
                className="cursor-pointer rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 active:translate-y-0.5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                Explore events
              </button>
            </div>

            <div className="flex items-center gap-4 pt-2 animate-in fade-in duration-1000">
              <div className="flex -space-x-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://picsum.photos/seed/seal-student-${i}/64/64`}
                    alt=""
                    className="h-9 w-9 rounded-full border-2 border-white object-cover dark:border-slate-900"
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Hundreds of student engineers
                <br className="sm:hidden" /> compete every season
              </p>
            </div>
          </div>

          <div className="relative hidden lg:col-span-6 lg:block">
            <div className="relative ml-auto max-w-lg">
              <img
                src="https://picsum.photos/seed/seal-hero-main/720/560"
                alt="Students collaborating during a SEAL hackathon"
                loading="eager"
                className="aspect-9/7 w-full rounded-3xl object-cover shadow-2xl shadow-blue-500/15 ring-1 ring-black/5 dark:ring-white/10"
              />

              {/* Floating: latest published standings */}
              <button
                type="button"
                disabled={!latestCompletedEvent}
                onClick={() =>
                  latestCompletedEvent &&
                  navigate(`/events/${latestCompletedEvent.id}/leaderboard`)
                }
                className="absolute -bottom-8 -left-10 w-72 cursor-pointer rounded-2xl border border-gray-100 bg-white/95 p-4 text-left shadow-xl shadow-blue-950/10 backdrop-blur transition-all hover:border-blue-300 hover:shadow-blue-500/15 disabled:cursor-default dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-black/40 dark:hover:border-blue-500/50"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                    <LeaderboardOutlinedIcon
                      className="shrink-0"
                      style={{ fontSize: 14 }}
                    />
                    <span className="truncate">
                      {latestCompletedEvent
                        ? latestCompletedEvent.name
                        : "Latest results"}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    Published
                  </span>
                </div>
                <div className="space-y-2">
                  {standingsLoading &&
                    [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-slate-800/70 motion-reduce:animate-none"
                      />
                    ))}

                  {!standingsLoading && leaderboardRows.length === 0 && (
                    <p className="rounded-lg bg-gray-50 px-3 py-4 text-center text-xs font-semibold text-gray-400 dark:bg-slate-800/70 dark:text-slate-500">
                      Results publish after each round.
                    </p>
                  )}

                  {leaderboardRows.slice(0, 3).map((row, index) => (
                    <div
                      key={row.id}
                      className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-slate-800/70"
                    >
                      <span
                        className={[
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-extrabold",
                          index === 0
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-500 ring-1 ring-gray-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700",
                        ].join(" ")}
                      >
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800 dark:text-slate-200">
                        {row.teamName}
                      </span>
                      <span className="text-sm font-bold tabular-nums text-blue-600 dark:text-blue-400">
                        {row.totalScore.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </button>

              {/* Floating: blind scoring chip */}
              <div className="absolute -right-4 -top-5 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-xl shadow-blue-950/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-black/40">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/30">
                  <VisibilityOffOutlinedIcon style={{ fontSize: 20 }} />
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Blind scoring
                  </p>
                  <p className="text-xs font-medium text-gray-400 dark:text-slate-500">
                    Judges never see team names
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative mt-16 grid grid-cols-2 divide-x divide-gray-100 rounded-2xl border border-gray-100 bg-gray-50/60 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/40 md:grid-cols-4">
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 py-7 text-center"
            >
              <span className="text-3xl font-extrabold tabular-nums tracking-tight text-gray-900 dark:text-white md:text-4xl">
                {stat.value}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Events / schedule                                           */}
      {/* ---------------------------------------------------------- */}
      <section
        id="schedule"
        className="scroll-mt-24 space-y-8 border-t border-gray-100 pt-16 dark:border-slate-800"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <CalendarMonthOutlinedIcon style={{ fontSize: 18 }} />
              The competition year
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              Three seasons. One league.
            </h2>
            <p className="max-w-lg text-base leading-relaxed text-gray-500 dark:text-slate-400">
              Spring, Summer, and Fall. Each season runs its own tracks,
              rounds, and prize pool — and every round feeds the public
              standings.
            </p>
          </Reveal>

          <div className="flex w-full rounded-lg bg-gray-100 p-1 dark:bg-slate-800/50 sm:w-auto">
            {seasons.map((season) => (
              <button
                key={season}
                type="button"
                onClick={() => handleSeasonChange(season)}
                className={[
                  "flex-1 cursor-pointer rounded-md px-4 py-1.5 text-sm font-semibold transition-all sm:flex-none",
                  activeSeason === season
                    ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300",
                ].join(" ")}
              >
                {season === "All"
                  ? "All"
                  : season.charAt(0) + season.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {eventsQuery.isLoading && (
          <div className="flex justify-center py-20">
            <CircularProgress />
          </div>
        )}

        {eventsQuery.isError && (
          <div className="rounded-xl border border-gray-200 bg-white py-14 text-center text-sm font-semibold text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            Events are unavailable right now. Try again in a moment.
          </div>
        )}

        {!eventsQuery.isLoading &&
          !eventsQuery.isError &&
          events.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white py-14 text-center text-sm font-semibold text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              The next season has not been announced yet. Check back soon.
            </div>
          )}

        {events.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={handleSelectEvent}
                onGoCompeting={handleGoCompeting}
                canCompete={
                  event.status === "ONGOING" &&
                  competitionEventIds.has(event.id)
                }
              />
            ))}
          </div>
        )}

        {pageCount > 1 && (
          <div className="flex justify-center pt-2">
            <Pagination
              count={pageCount}
              page={filters.page}
              onChange={(_, value) => handlePageChange(value)}
              variant="outlined"
              shape="rounded"
              sx={paginationSx}
            />
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------- */}
      {/* How it works                                                */}
      {/* ---------------------------------------------------------- */}
      <section
        id="teams"
        className="scroll-mt-24 border-t border-gray-100 pt-16 dark:border-slate-800"
      >
        <Reveal className="mb-12 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <RocketLaunchOutlinedIcon style={{ fontSize: 18 }} />
            How a season works
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            From sign-up to the final round
          </h2>
          <p className="text-base leading-relaxed text-gray-500 dark:text-slate-400">
            Everything happens on the platform — registration, team formation,
            submissions, grading, and results.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {seasonSteps.map((step, index) => (
            <Reveal key={step.title} delay={index * 100}>
              <div className="relative h-full space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                    <step.icon style={{ fontSize: 24 }} />
                  </span>
                  <span className="text-4xl font-extrabold tabular-nums text-gray-200 dark:text-slate-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {index < seasonSteps.length - 1 && (
                    <span
                      aria-hidden
                      className="hidden h-px flex-1 bg-linear-to-r from-gray-200 to-transparent dark:from-slate-700 lg:block"
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500 dark:text-slate-400">
                    {step.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Fair judging bento                                          */}
      {/* ---------------------------------------------------------- */}
      <section
        id="projects"
        className="scroll-mt-24 border-t border-gray-100 pt-16 dark:border-slate-800"
      >
        <Reveal className="mb-12 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <BalanceOutlinedIcon style={{ fontSize: 18 }} />
            Judging you can trust
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Scored in the open
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-gray-500 dark:text-slate-400">
            Judging is the product. SEAL is built so every team can trust the
            result — and every score can be explained.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Blind scoring — large card with mock score sheet */}
          <Reveal className="lg:col-span-2">
            <div className="grid h-full grid-cols-1 gap-8 rounded-3xl bg-linear-to-br from-blue-50 via-white to-blue-50/40 p-8 ring-1 ring-blue-100 dark:from-blue-500/10 dark:via-slate-900 dark:to-slate-900 dark:ring-blue-500/20 md:grid-cols-2 md:p-10">
              <div className="flex flex-col justify-between gap-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/30">
                  <VisibilityOffOutlinedIcon style={{ fontSize: 24 }} />
                </span>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
                    Blind, criterion-based scoring
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                    Judges grade against criteria published before the round
                    starts, without seeing team names. Every individual score
                    is recorded and preserved, so results can always be
                    explained.
                  </p>
                </div>
              </div>

              {/* Mock score sheet */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg shadow-blue-950/5 dark:border-slate-800 dark:bg-slate-950/60 dark:shadow-black/20">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                    Submission #F3A9 · Anonymous
                  </span>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                    Round 1
                  </span>
                </div>
                <div className="space-y-3">
                  {scoreSheetRows.map((criterion) => (
                    <div key={criterion.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-gray-600 dark:text-slate-300">
                          {criterion.name}
                        </span>
                        <span className="tabular-nums text-gray-400 dark:text-slate-500">
                          {criterion.score}/{criterion.max}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${(criterion.score / criterion.max) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-slate-800">
                  <span className="text-xs font-bold text-gray-500 dark:text-slate-400">
                    Weighted total
                  </span>
                  <span className="text-lg font-extrabold tabular-nums text-blue-600 dark:text-blue-400">
                    8.4
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Panel judging */}
          <Reveal delay={100}>
            <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <img
                src="https://picsum.photos/seed/seal-panel/640/280"
                alt="A judging panel reviewing submissions"
                loading="lazy"
                className="h-36 w-full object-cover"
              />
              <div className="flex flex-1 flex-col gap-2 p-6">
                <div className="flex items-center gap-2">
                  <BalanceOutlinedIcon
                    style={{ fontSize: 18 }}
                    className="text-blue-500"
                  />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    More than one opinion
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-slate-400">
                  Each submission is graded by a panel of internal and guest
                  judges, never a single voice. Calibration rounds keep the
                  panel consistent before real grading starts.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Public standings */}
          <Reveal delay={100}>
            <button
              type="button"
              onClick={() => navigate("/standings")}
              className="group flex h-full w-full cursor-pointer flex-col justify-between gap-6 rounded-3xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <LeaderboardOutlinedIcon
                    style={{ fontSize: 18 }}
                    className="text-blue-500"
                  />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Public standings
                  </h3>
                </div>
                {latestCompletedEvent && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                    {latestCompletedEvent.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {standingsLoading &&
                  [1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-5 animate-pulse rounded bg-gray-100 dark:bg-slate-800 motion-reduce:animate-none"
                    />
                  ))}

                {!standingsLoading && leaderboardRows.length === 0 && (
                  <p className="text-sm leading-relaxed text-gray-500 dark:text-slate-400">
                    Rankings are published per round and visible to everyone.
                  </p>
                )}

                {leaderboardRows.slice(0, 4).map((row, index) => (
                  <div
                    key={row.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="w-5 shrink-0 text-center font-extrabold tabular-nums text-gray-300 dark:text-slate-600">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-semibold text-gray-700 dark:text-slate-300">
                      {row.teamName}
                    </span>
                    <span className="font-bold tabular-nums text-gray-400 dark:text-slate-500">
                      {row.totalScore.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-transform group-hover:translate-x-1 dark:text-blue-400 motion-reduce:group-hover:translate-x-0">
                View standings
                <ArrowForwardRoundedIcon style={{ fontSize: 16 }} />
              </span>
            </button>
          </Reveal>

          {/* Research-grade data */}
          <Reveal delay={200} className="lg:col-span-2">
            <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-gray-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-300">
                  <InsightsOutlinedIcon style={{ fontSize: 22 }} />
                </span>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Research-grade fairness
                  </h3>
                  <p className="max-w-lg text-sm leading-relaxed text-gray-500 dark:text-slate-400">
                    Every judge × criterion score is preserved and analyzed for
                    inter-rater reliability, so scoring quality is measured —
                    not assumed. Exported research data is always anonymized.
                  </p>
                </div>
              </div>
              <ul className="shrink-0 space-y-2">
                {["Scores never deleted", "Judge identity protected", "Variance monitored"].map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-300"
                    >
                      <CheckRoundedIcon
                        style={{ fontSize: 16 }}
                        className="text-blue-500"
                      />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Roles                                                       */}
      {/* ---------------------------------------------------------- */}
      <section className="border-t border-gray-100 pt-16 dark:border-slate-800">
        <Reveal className="mb-12 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <GroupsOutlinedIcon style={{ fontSize: 18 }} />
            One platform, every role
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Built for the whole competition
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role, index) => (
            <Reveal key={role.title} delay={index * 80}>
              <div className="h-full space-y-4 rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50 motion-reduce:hover:translate-y-0">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-300">
                  <role.icon style={{ fontSize: 22 }} />
                </span>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {role.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500 dark:text-slate-400">
                    {role.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Testimonials                                                */}
      {/* ---------------------------------------------------------- */}
      <section className="border-t border-gray-100 pt-16 dark:border-slate-800">
        <Reveal className="mb-12 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <EmojiEventsOutlinedIcon style={{ fontSize: 18 }} />
            From the community
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Heard around the league
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 100}>
              <figure className="flex h-full flex-col justify-between gap-6 rounded-2xl border border-gray-200 bg-white p-7 dark:border-slate-800 dark:bg-slate-900">
                <div className="space-y-4">
                  <FormatQuoteRoundedIcon
                    style={{ fontSize: 32 }}
                    className="text-blue-200 dark:text-blue-500/30"
                  />
                  <blockquote className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                    {testimonial.quote}
                  </blockquote>
                </div>
                <figcaption className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt=""
                    loading="lazy"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-xs font-medium text-gray-400 dark:text-slate-500">
                      {testimonial.role}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* FAQ                                                         */}
      {/* ---------------------------------------------------------- */}
      <section className="border-t border-gray-100 pt-16 dark:border-slate-800">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <Reveal className="space-y-3 lg:col-span-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              Questions,
              <br />
              answered.
            </h2>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-slate-400">
              Everything you need to know before the next season opens. Still
              unsure? Reach out through the support links below.
            </p>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-8">
            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
              {faqs.map((faq) => (
                <details key={faq.q} className="group px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-gray-900 marker:hidden dark:text-white [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <ExpandMoreRoundedIcon
                      className="shrink-0 text-gray-400 transition-transform group-open:rotate-180 dark:text-slate-500"
                      style={{ fontSize: 22 }}
                    />
                  </summary>
                  <p className="pt-3 text-sm leading-relaxed text-gray-500 dark:text-slate-400">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Final CTA                                                   */}
      {/* ---------------------------------------------------------- */}
      <section className="pb-4">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 to-blue-700 px-8 py-14 text-center md:px-14 md:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.14),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.25),transparent_45%)]"
            />
            <div className="relative mx-auto max-w-2xl space-y-6">
              <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                Ready for the next season?
              </h2>
              <p className="mx-auto max-w-lg text-base leading-relaxed text-blue-100">
                Registration opens before each season starts. Create your
                account now so your team is ready the moment it does.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="cursor-pointer rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50 active:translate-y-0.5"
                >
                  Create your account
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/standings")}
                  className="cursor-pointer rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/20 active:translate-y-0.5"
                >
                  See the standings
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
