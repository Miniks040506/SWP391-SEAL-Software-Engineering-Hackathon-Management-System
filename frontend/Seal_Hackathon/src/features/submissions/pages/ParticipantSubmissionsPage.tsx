import { useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import { Alert } from "@mui/material";
import { teamApi } from "@/api/team.api";
import { usePublicEventDetailQuery } from "@/features/events/hooks/usePublicEventQueries";
import { MentorFeedbackCard } from "@/features/teams/components/MentorFeedbackCard";
import { useTeamFeedback } from "@/features/teams/hooks/useTeamFeedback";
import type { SubmissionResponse } from "@/types/submission.types";
import { useTeamSubmissionsQuery } from "../hooks/useParticipantSubmissionQueries";
import { SubmissionLedgerRow } from "../components/SubmissionLedgerRow";
import {
  formatDay,
  groupFeedbackBySubmission,
  summarizeSubmissions,
} from "../utils/submissionHistoryFormat";
import { useCountUp } from "../hooks/useCountUp";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import "../styles/submissionHistory.css";

export function ParticipantSubmissionsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { submissions, loading, error, refetch } =
    useTeamSubmissionsQuery(teamId);
  const feedbackQuery = useTeamFeedback(teamId);
  const { ref: ledgerRef, revealed: ledgerRevealed } =
    useScrollReveal<HTMLUListElement>();
  const { ref: otherFeedbackRef, revealed: otherFeedbackRevealed } =
    useScrollReveal<HTMLElement>();

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
  const totalCount = useCountUp(summary.total);
  const submittedCount = useCountUp(summary.submitted);
  const roundsCount = useCountUp(summary.rounds);
  const feedbackGroups = useMemo(
    () => groupFeedbackBySubmission(submissions, feedbackQuery.data ?? []),
    [feedbackQuery.data, submissions],
  );
  const stats = [
    { label: "Submissions", value: `${Math.round(totalCount)}` },
    { label: "Submitted", value: `${Math.round(submittedCount)}` },
    { label: "Rounds covered", value: `${Math.round(roundsCount)}` },
    { label: "Latest activity", value: formatDay(summary.latest) ?? "None" },
  ];

  const hasStats = !loading && !error && submissions.length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-4">
      <button
        type="button"
        onClick={handleBack}
        className="sh-back inline-flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-slate-400 dark:hover:text-blue-400"
      >
        <ArrowBackIcon style={{ fontSize: 16 }} />
        Back to competing
      </button>

      <section className="sh-hero relative isolate overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-slate-800">
        {showBanner ? (
          <img
            src={bannerUrl ?? ""}
            alt=""
            aria-hidden
            onError={() => setBannerBroken(true)}
            className="sh-banner absolute inset-0 -z-10 h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900"
          />
        )}

        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-4/5 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent"
        />

        <div className="flex min-h-72 flex-col justify-end px-6 py-8 sm:px-8 sm:py-10">
          <p style={{ "--i": 0 } as React.CSSProperties} className="sh-hero-part text-xs font-bold tracking-[0.18em] text-blue-200 uppercase">
            Submission history
          </p>
          <h1 style={{ "--i": 1 } as React.CSSProperties} className="sh-hero-part mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {eventName}
          </h1>

          {(teamName || trackName) && (
            <div style={{ "--i": 2 } as React.CSSProperties} className="sh-hero-part mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
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
        </div>
      </section>

      {hasStats && (
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-800 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              style={{ "--i": index } as React.CSSProperties}
              className="sh-stat bg-white px-5 py-4 dark:bg-slate-900"
            >
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {stat.label}
              </dt>
              <dd className="mt-1 truncate text-xl font-bold tracking-tight text-slate-950 tabular-nums dark:text-white">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <section className="overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200 dark:bg-slate-950/30 dark:ring-slate-800">
        <div className="sh-section-head border-b border-slate-200 bg-white px-5 py-5 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
            Submissions and feedback
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Each mentor note appears with the submission it reviews.
          </p>
        </div>

        {feedbackQuery.isError && (
          <div className="px-4 pt-4 sm:px-5">
            <Alert
              severity="warning"
              action={
                <button
                  type="button"
                  onClick={() => void feedbackQuery.refetch()}
                  className="cursor-pointer rounded px-2 py-1 text-xs font-bold uppercase"
                >
                  Retry
                </button>
              }
            >
              Submission history loaded, but mentor feedback could not be
              loaded.
            </Alert>
          </div>
        )}

        {loading ? (
          <ul className="space-y-3 p-4 sm:p-5">
            {[0, 1, 2].map((index) => (
              <li
                key={index}
                className="flex items-center gap-4 rounded-2xl bg-white px-5 py-6 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
                aria-hidden
              >
                <div className="flex-1 space-y-2">
                  <div className="sh-skeleton h-4 w-48 rounded bg-gray-200 dark:bg-slate-800" />
                  <div className="sh-skeleton h-3 w-24 rounded bg-gray-100 dark:bg-slate-800/60" />
                </div>
                <div className="sh-skeleton h-9 w-24 rounded-lg bg-gray-100 dark:bg-slate-800/60" />
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
            <span className="sh-empty-icon flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500">
              <InboxOutlinedIcon style={{ fontSize: 24 }} />
            </span>
            <p className="sh-empty-copy mt-4 text-base font-semibold text-gray-900 dark:text-white">
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
          <ul ref={ledgerRef} className="space-y-4 p-4 sm:p-5">
            {submissions.map((submission, index) => (
              <SubmissionLedgerRow
                key={submission.id}
                submission={submission}
                feedbacks={feedbackGroups.bySubmission.get(submission.id) ?? []}
                feedbackLoading={feedbackQuery.isLoading}
                feedbackError={feedbackQuery.isError}
                now={now}
                onOpen={openSubmission}
                motionStyle={{ "--i": index } as React.CSSProperties}
                motionClassName={
                  index < 4
                    ? "sh-row"
                    : ledgerRevealed
                      ? "sh-row sh-reveal"
                      : "sh-row sh-reveal-idle"
                }
              />
            ))}
          </ul>
        )}
      </section>

      {!feedbackQuery.isLoading &&
        !feedbackQuery.isError &&
        feedbackGroups.other.length > 0 && (
          <section
            ref={otherFeedbackRef}
            aria-labelledby="other-feedback-heading"
            className={otherFeedbackRevealed ? "sh-reveal" : "sh-reveal-idle"}
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                <RateReviewOutlinedIcon style={{ fontSize: 21 }} />
              </span>
              <div>
                <h2
                  id="other-feedback-heading"
                  className="text-lg font-bold tracking-tight text-slate-900 dark:text-white"
                >
                  Other mentor feedback
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Team-wide guidance and notes from submissions outside this
                  ledger.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {feedbackGroups.other.map((feedback, index) => (
                <div key={feedback.id} style={{ "--delay": `${index * 55}ms` } as React.CSSProperties} className="sh-reveal">
                  <MentorFeedbackCard feedback={feedback} showSubmissionContext />
                </div>
              ))}
            </div>
          </section>
        )}
    </div>
  );
}
