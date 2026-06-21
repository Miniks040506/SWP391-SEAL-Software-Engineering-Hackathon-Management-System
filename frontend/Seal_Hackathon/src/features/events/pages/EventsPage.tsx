import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import { CircularProgress, Pagination } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { teamApi } from "@/api/team.api";
import { EventCard } from "@/features/events/components/EventCard";
import { usePublicEventsQuery } from "@/features/events/hooks/usePublicEventQueries";
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
    <div className="animate-in space-y-16 fade-in duration-500">
      <section
        id="dashboard"
        className="grid scroll-mt-24 grid-cols-1 items-center gap-12 py-4 md:py-8 lg:grid-cols-12"
      >
        <div className="space-y-6 lg:col-span-7">
          <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl dark:text-white">
            Build something worth{" "}
            <span className="text-blue-500">judging.</span>
          </h1>

          <p className="max-w-md text-lg leading-relaxed text-gray-500 dark:text-slate-400">
            Form a team, ship real software, and climb a transparent
            leaderboard across seasonal FPT hackathons.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="rounded-lg bg-gray-900 px-7 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-black active:translate-y-0.5 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Get Started
            </button>

            <button
              type="button"
              onClick={scrollToSchedule}
              className="rounded-lg border border-gray-200 bg-white px-7 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 active:translate-y-0.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Explore Events
            </button>
          </div>
        </div>

        <div className="hidden lg:col-span-5 lg:block">
          <div className="relative pb-12 pl-10">
            <img
              src="https://picsum.photos/seed/seal-hackathon-build/640/720"
              alt="Students collaborating during a hackathon sprint"
              loading="eager"
              className="aspect-4/5 w-full rounded-2xl object-cover shadow-xl shadow-blue-500/10"
            />
            <img
              src="https://picsum.photos/seed/seal-office-team/480/340"
              alt="Participants working together during an event"
              loading="lazy"
              className="absolute bottom-0 left-0 w-52 rounded-xl border-4 border-white object-cover shadow-lg dark:border-slate-900"
            />
          </div>
        </div>
      </section>

      <section
        id="schedule"
        className="scroll-mt-24 space-y-8 border-t border-gray-100 pt-14 dark:border-slate-800"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AutoAwesomeIcon
                style={{ fontSize: 20 }}
                className="text-blue-500"
              />
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-white">
                Three seasons a year
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-relaxed text-gray-500 dark:text-slate-400">
              Spring, Summer, and Fall. Each season runs its own tracks,
              rounds, and prize pool.
            </p>
          </div>

          <div className="flex w-full rounded-lg bg-gray-100 p-1 dark:bg-slate-800/50 sm:w-auto">
            {seasons.map((season) => (
              <button
                key={season}
                type="button"
                onClick={() => handleSeasonChange(season)}
                className={[
                  "flex-1 rounded-md px-4 py-1.5 text-sm font-semibold transition-all sm:flex-none",
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

      <section
        id="teams"
        className="grid scroll-mt-24 grid-cols-1 gap-12 border-t border-gray-100 pt-14 dark:border-slate-800 lg:grid-cols-12"
      >
        <div className="space-y-3 lg:col-span-4">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-white">
            How a season works
          </h2>
          <p className="text-sm leading-relaxed text-gray-500 dark:text-slate-400">
            From registration to the final round, everything happens on the
            platform.
          </p>
        </div>

        <div className="lg:col-span-8">
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {seasonSteps.map((step) => (
              <div
                key={step.title}
                className="flex items-start gap-5 py-7 first:pt-0 last:pb-0"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-300">
                  <step.icon style={{ fontSize: 22 }} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="max-w-xl text-sm leading-relaxed text-gray-500 dark:text-slate-400">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="projects"
        className="scroll-mt-24 space-y-8 border-t border-gray-100 pt-14 dark:border-slate-800"
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-white">
            Scored in the open
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-gray-500 dark:text-slate-400">
            Judging is the product. SEAL is built so every team can trust the
            result.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:grid-rows-2">
          <div className="flex h-full flex-col justify-between gap-10 rounded-2xl bg-linear-to-br from-blue-50 via-white to-blue-50/40 p-8 ring-1 ring-blue-100 md:p-10 dark:from-blue-500/10 dark:via-slate-900 dark:to-slate-900 dark:ring-blue-500/20 lg:col-span-2 lg:row-span-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/30">
              <VisibilityOffOutlinedIcon style={{ fontSize: 24 }} />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900 md:text-2xl dark:text-white">
                Blind, criterion-based scoring
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                Judges grade against criteria published before the round
                starts, without seeing team names. Every individual score is
                recorded and preserved, so results can always be explained.
              </p>
            </div>
          </div>

          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700">
            <img
              src="https://picsum.photos/seed/seal-judging-panel/520/240"
              alt="A judging panel reviewing submissions"
              loading="lazy"
              className="h-32 w-full object-cover"
            />
            <div className="space-y-1.5 bg-white p-6 dark:bg-slate-900">
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
                judges, never a single voice.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/standings")}
            className="group flex h-full w-full flex-col justify-between gap-6 rounded-2xl border border-gray-200 bg-white p-6 text-left transition-all hover:border-blue-400 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500"
          >
            <div className="flex items-center gap-2">
              <LeaderboardOutlinedIcon
                style={{ fontSize: 18 }}
                className="text-blue-500"
              />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Public standings
              </h3>
            </div>
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-gray-500 dark:text-slate-400">
                Rankings are published per round and visible to everyone.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-transform group-hover:translate-x-1 dark:text-blue-400">
                View Standings <ChevronRightIcon style={{ fontSize: 16 }} />
              </span>
            </div>
          </button>
        </div>
      </section>

      <section className="pb-4">
        <div className="flex flex-col items-start justify-between gap-8 rounded-2xl bg-blue-600 p-10 md:flex-row md:items-center md:p-14">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Ready for the next season?
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-blue-100">
              Registration opens before each season starts. Create your account
              now so your team is ready.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="shrink-0 rounded-lg bg-white px-8 py-3 text-sm font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50 active:translate-y-0.5"
          >
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
}
