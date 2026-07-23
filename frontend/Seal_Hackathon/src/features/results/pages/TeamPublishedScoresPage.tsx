import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import EqualizerOutlinedIcon from "@mui/icons-material/EqualizerOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { teamApi } from "@/api/team.api";
import { JudgeAnonymityNotice } from "../components/JudgeAnonymityNotice";

const formatPublishedAt = (value?: string | null) => {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export const TeamPublishedScoresPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const teamRoute = location.pathname.startsWith("/mentor/")
    ? `/mentor/teams/${teamId}`
    : `/participant/teams/${teamId}`;

  const {
    data: scores = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["teamPublishedScores", teamId],
    queryFn: () => teamApi.getTeamPublishedScores(teamId!),
    enabled: Boolean(teamId),
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl space-y-5 px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-28 max-w-2xl animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-16 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse bg-white dark:bg-slate-900"
            />
          ))}
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Failed to load published scores. Please try again.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-64px)] bg-[#f4f6f8] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to={teamRoute}
            className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-blue-600 focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ArrowBackOutlinedIcon
              className="transition-transform group-hover:-translate-x-1"
              style={{ fontSize: 18 }}
            />
            Back to team
          </Link>
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            <EqualizerOutlinedIcon style={{ fontSize: 18 }} />
            Published results
          </span>
        </div>

        <header className="relative mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-6 py-10 shadow-[0_18px_60px_rgba(30,41,59,0.08)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none md:px-10 md:py-12">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-100/70 blur-3xl dark:bg-blue-500/10" />
          <h1 className="relative max-w-5xl text-4xl font-black tracking-[-0.04em] [text-wrap:balance] md:text-6xl">
            Published team scores
          </h1>
          <p className="relative mt-4 max-w-[65ch] text-base leading-7 text-slate-500 dark:text-slate-400">
            Official round results and detailed score breakdowns appear here
            after publication.
          </p>
        </header>

        <div className="mt-8">
          <JudgeAnonymityNotice />
        </div>

        {scores.length === 0 ? (
          <section className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <EqualizerOutlinedIcon
              className="text-slate-300 dark:text-slate-600"
              style={{ fontSize: 42 }}
            />
            <h2 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
              No published scores yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              The coordinator has not published a score for this team.
            </p>
          </section>
        ) : (
          <section
            className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            aria-labelledby="score-summary-heading"
          >
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800 md:px-8">
              <div>
                <h2
                  id="score-summary-heading"
                  className="text-2xl font-black tracking-tight"
                >
                  Score summary
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Select a round to inspect the full breakdown.
                </p>
              </div>
              <span className="text-sm font-bold tabular-nums text-slate-400 dark:text-slate-500">
                {scores.length} {scores.length === 1 ? "round" : "rounds"}
              </span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {scores.map((score) => (
                <article
                  key={`${score.teamId}-${score.roundId}`}
                  className="group px-6 py-6 transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-500/5 md:px-8"
                >
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                          {score.roundName}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${score.finalRound ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" : score.advanced ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
                        >
                          {score.finalRound
                            ? "Final result"
                            : score.advanced
                              ? "Advanced"
                              : "Not advanced"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {score.eventName} · {score.trackName}
                      </p>

                      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                            Total score
                          </dt>
                          <dd className="mt-1 text-2xl font-black tabular-nums text-slate-950 dark:text-white">
                            {score.totalScore}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                            Rank
                          </dt>
                          <dd className="mt-1 text-2xl font-black tabular-nums text-slate-950 dark:text-white">
                            #{score.rankPosition}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                            Judges
                          </dt>
                          <dd className="mt-1 text-2xl font-black tabular-nums text-slate-950 dark:text-white">
                            {score.judgeCount}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                            Published
                          </dt>
                          <dd className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
                            {formatPublishedAt(score.publishedAt)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`${teamRoute}/rounds/${score.roundId}/scores`)
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 active:translate-y-0 lg:min-w-44"
                    >
                      View breakdown
                      <ArrowForwardOutlinedIcon style={{ fontSize: 18 }} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <p className="mt-5 inline-flex items-center gap-2 text-xs leading-5 text-slate-400 dark:text-slate-500">
          <EventOutlinedIcon style={{ fontSize: 16 }} />
          Scores shown here are final published results.
        </p>
      </div>
    </main>
  );
};
