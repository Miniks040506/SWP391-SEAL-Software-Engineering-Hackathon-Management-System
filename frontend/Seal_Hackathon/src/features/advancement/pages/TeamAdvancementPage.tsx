import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import { Link, useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { useTeamAdvancementStatusQuery } from "../hooks/useAdvancementQueries";
import { TeamAdvancementStatusBanner } from "../components/TeamAdvancementStatusBanner";

export function TeamAdvancementPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const validTeamId = teamId || "";
  const navigate = useNavigate();

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useTeamAdvancementStatusQuery(validTeamId);
  const data = response?.data;

  if (isError && isAxiosError(error) && error.response?.status === 403) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">
        <p className="text-lg font-black text-slate-900 dark:text-white">
          You do not have access to this team.
        </p>
        <button
          type="button"
          onClick={() => navigate("/participant/teams")}
          className="mt-4 text-sm font-bold text-blue-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:text-blue-400"
        >
          Back to my teams
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-64px)] bg-[#f4f6f8] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <Link
          to={`/participant/teams/${validTeamId}`}
          className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-blue-600 focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          <ArrowBackOutlinedIcon
            className="transition-transform group-hover:-translate-x-1"
            style={{ fontSize: 18 }}
          />
          Back to team
        </Link>

        <header className="relative mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-6 py-10 shadow-[0_18px_60px_rgba(30,41,59,0.08)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none md:px-10 md:py-12">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-100/70 blur-3xl dark:bg-blue-500/10" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3 text-sm font-bold text-blue-600 dark:text-blue-400">
                <RouteOutlinedIcon style={{ fontSize: 20 }} />
                Team progress
              </div>
              <h1 className="mt-4 max-w-5xl text-4xl font-black tracking-[-0.04em] [text-wrap:balance] md:text-6xl">
                Advancement status
              </h1>
              {data && (
                <p className="mt-4 text-base leading-7 text-slate-500 dark:text-slate-400">
                  {data.teamName} in {data.eventName}
                  {data.currentRoundName
                    ? `, current round: ${data.currentRoundName}`
                    : ""}
                </p>
              )}
            </div>
            <Link
              to={`/participant/teams/${validTeamId}/scores`}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:translate-y-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-300"
            >
              Published scores
            </Link>
          </div>
        </header>

        <section className="mt-8" aria-live="polite">
          {isLoading && (
            <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="h-5 w-36 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-10 w-2/3 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
          )}

          {isError && (
            <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              Failed to load advancement status. Please try again.
            </div>
          )}

          {data && (
            <TeamAdvancementStatusBanner
              status={data.status}
              message={data.message}
              nextRoundId={data.nextRoundId}
              nextRoundName={data.nextRoundName}
              canAccessNextRound={data.canAccessNextRound}
              eventId={data.eventId}
            />
          )}
        </section>
      </div>
    </main>
  );
}
