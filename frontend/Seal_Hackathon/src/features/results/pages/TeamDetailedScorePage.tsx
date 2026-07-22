import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import { Link, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { teamApi } from "@/api/team.api";
import { JudgeAnonymityNotice } from "../components/JudgeAnonymityNotice";
import { TeamScoreSummaryCard } from "../components/TeamScoreSummaryCard";
import { CriterionScoreBreakdownTable } from "../components/CriterionScoreBreakdownTable";

export const TeamDetailedScorePage = () => {
  const { teamId, roundId } = useParams<{ teamId: string; roundId: string }>();
  const location = useLocation();
  const teamRoute = location.pathname.startsWith("/mentor/")
    ? `/mentor/teams/${teamId}`
    : `/participant/teams/${teamId}`;

  const {
    data: scoreData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["teamPublishedScore", teamId, roundId],
    queryFn: () => teamApi.getTeamPublishedRoundScore(teamId!, roundId!),
    enabled: Boolean(teamId && roundId),
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl space-y-5 px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-32 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-36 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Failed to load score data. Please try again.
        </div>
      </main>
    );
  }

  if (!scoreData) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <p className="text-lg font-black text-slate-900 dark:text-white">
          Score details are unavailable.
        </p>
        <Link
          className="mt-4 inline-block text-sm font-bold text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
          to={`${teamRoute}/scores`}
        >
          Back to published scores
        </Link>
      </main>
    );
  }

  if (!scoreData.publishedAt) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <p className="text-lg font-black text-slate-900 dark:text-white">
          Scores are hidden until results are published.
        </p>
        <Link
          className="mt-4 inline-block text-sm font-bold text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
          to={`${teamRoute}/scores`}
        >
          Back to published scores
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-64px)] bg-[#f4f6f8] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <Link
          to={`${teamRoute}/scores`}
          className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-blue-600 focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          <ArrowBackOutlinedIcon
            className="transition-transform group-hover:-translate-x-1"
            style={{ fontSize: 18 }}
          />
          Back to published scores
        </Link>

        <header className="relative mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-6 py-10 shadow-[0_18px_60px_rgba(30,41,59,0.08)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none md:px-10 md:py-12">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-100/70 blur-3xl dark:bg-blue-500/10" />
          <div className="relative flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              <InsightsOutlinedIcon style={{ fontSize: 25 }} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                Detailed result
              </p>
              <h1 className="mt-3 max-w-5xl text-4xl font-black tracking-[-0.04em] [text-wrap:balance] md:text-6xl">
                {scoreData.teamName}
              </h1>
              <p className="mt-4 max-w-[65ch] text-base leading-7 text-slate-500 dark:text-slate-400">
                {scoreData.eventName} in {scoreData.roundName},{" "}
                {scoreData.trackName}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-8">
          <JudgeAnonymityNotice />
        </div>

        <section
          className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:p-7"
          aria-label="Score summary"
        >
          <TeamScoreSummaryCard
            totalScore={scoreData.totalScore}
            rankPosition={scoreData.rankPosition}
            trackName={scoreData.trackName}
            roundName={scoreData.roundName}
            advanced={scoreData.advanced}
          />
        </section>

        <section className="mt-8" aria-labelledby="criteria-heading">
          <div className="mb-4">
            <h2
              id="criteria-heading"
              className="text-2xl font-black tracking-tight"
            >
              Criteria breakdown
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              A transparent view of how the published total was calculated.
            </p>
          </div>
          <CriterionScoreBreakdownTable criteria={scoreData.criteriaScores} />
        </section>
      </div>
    </main>
  );
};
