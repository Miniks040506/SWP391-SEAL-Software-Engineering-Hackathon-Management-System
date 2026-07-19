import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { Alert } from "@mui/material";
import { teamApi } from "@/api/team.api";
import { usePublicEventDetailQuery } from "@/features/events/hooks/usePublicEventQueries";
import type { SubmissionResponse } from "@/types/submission.types";
import { useTeamSubmissionsQuery } from "../hooks/useParticipantSubmissionQueries";
import { SubmissionLedgerRow } from "../components/SubmissionLedgerRow";
import {
  formatDay,
  summarizeSubmissions,
} from "../utils/submissionHistoryFormat";

export function ParticipantSubmissionsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { submissions, loading, error, refetch } =
    useTeamSubmissionsQuery(teamId);

  // Relative labels here are day-scale, so a snapshot at mount is enough and
  // avoids re-rendering the whole ledger every second.
  const [now] = useState(() => Date.now());

  // Some seeded events point at banners that no longer resolve, so the hero
  // has to survive a broken image rather than showing a torn placeholder.
  const [bannerBroken, setBannerBroken] = useState(false);

  const activeCompetitionsQuery = useQuery({
    queryKey: ["my-active-competitions"],
    queryFn: () => teamApi.getMyActiveCompetitions(),
  });

  const activeCompetition = (activeCompetitionsQuery.data ?? []).find(
    (item) => item.teamId === teamId,
  );

  const eventQuery = usePublicEventDetailQuery(activeCompetition?.eventId);
  const bannerUrl = eventQuery.data?.bannerUrl;
  const showBanner = Boolean(bannerUrl) && !bannerBroken;

  const handleBack = () => {
    if (location.key !== "default") {
      navigate(-1);
      return;
    }

    if (activeCompetition) {
      navigate(`/participant/events/${activeCompetition.eventId}/competing`, {
        state: { fromInternal: true },
      });
    } else {
      navigate(`/participant/teams/${teamId}`);
    }
  };

  const openSubmission = (submission: SubmissionResponse) =>
    navigate(
      `/participant/teams/${teamId}/rounds/${submission.roundId}/submission`,
    );

  const teamName = activeCompetition?.teamName ?? submissions[0]?.teamName;
  const trackName = activeCompetition?.trackName ?? submissions[0]?.trackName;
  const eventName =
    eventQuery.data?.name ?? activeCompetition?.eventName ?? "Your submissions";

  const summary = summarizeSubmissions(submissions);
  const stats = [
    { label: "Submissions", value: `${summary.total}` },
    { label: "Submitted", value: `${summary.submitted}` },
    { label: "Rounds covered", value: `${summary.rounds}` },
    { label: "Latest activity", value: formatDay(summary.latest) ?? "—" },
  ];

  const hasStats = !loading && !error && submissions.length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-4">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-slate-400 dark:hover:text-blue-400"
      >
        <ArrowBackIcon style={{ fontSize: 16 }} />
        Back to competing
      </button>

      {/* ── Event hero ──────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-slate-800">
        {showBanner ? (
          <img
            src={bannerUrl ?? ""}
            alt=""
            aria-hidden
            onError={() => setBannerBroken(true)}
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900"
          />
        )}

        {/* Matches the event detail hero: a light overall veil plus a
            bottom-weighted scrim, so the banner stays visible while the
            bottom-anchored copy keeps its contrast. */}
        {/* Same recipe as the event detail hero: a single bottom-weighted
            scrim and no overall veil, so the artwork stays bright. The hero is
            tall enough that the bottom-anchored copy sits inside the dark
            band rather than over the picture. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-4/5 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent"
        />

        <div className="flex min-h-90 flex-col justify-end px-6 py-8 sm:px-8 sm:py-10">
          <p className="text-xs font-bold tracking-[0.18em] text-blue-200 uppercase">
            Submission history
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {eventName}
          </h1>

          {(teamName || trackName) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
              {teamName && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-white ring-1 ring-white/20 backdrop-blur-sm">
                  <GroupsOutlinedIcon style={{ fontSize: 14 }} />
                  {teamName}
                </span>
              )}
              {trackName && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-white ring-1 ring-white/20 backdrop-blur-sm">
                  <CategoryOutlinedIcon style={{ fontSize: 14 }} />
                  {trackName}
                </span>
              )}
            </div>
          )}

          {hasStats && (
            <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/15 pt-5 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs font-medium text-white/75">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 truncate text-xl font-semibold tracking-tight text-white tabular-nums">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* ── Ledger ──────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <ul className="divide-y divide-gray-100 dark:divide-slate-800">
            {[0, 1, 2].map((index) => (
              <li
                key={index}
                className="flex items-center gap-4 px-5 py-4"
                aria-hidden
              >
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-gray-200 motion-safe:animate-pulse dark:bg-slate-800" />
                  <div className="h-3 w-24 rounded bg-gray-100 motion-safe:animate-pulse dark:bg-slate-800/60" />
                </div>
                <div className="h-9 w-24 rounded-lg bg-gray-100 motion-safe:animate-pulse dark:bg-slate-800/60" />
              </li>
            ))}
            <li className="sr-only">Loading submissions…</li>
          </ul>
        ) : error ? (
          <div className="p-5">
            <Alert
              severity="error"
              action={
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="cursor-pointer rounded px-2 py-1 text-xs font-bold uppercase"
                >
                  Retry
                </button>
              }
            >
              Your submission history could not be loaded, so this is not an
              empty history. Retry, or go back and reopen this team from the
              competing page.
            </Alert>
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500">
              <InboxOutlinedIcon style={{ fontSize: 24 }} />
            </span>
            <p className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
              Nothing filed yet
            </p>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-gray-500 dark:text-slate-400">
              Submissions appear here once your team files deliverables for a
              round that a coordinator has opened.
            </p>
            {activeCompetition && (
              <button
                type="button"
                onClick={handleBack}
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-slate-900"
              >
                Go to the competing page
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-slate-800">
            {submissions.map((submission) => (
              <SubmissionLedgerRow
                key={submission.id}
                submission={submission}
                now={now}
                onOpen={openSubmission}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
