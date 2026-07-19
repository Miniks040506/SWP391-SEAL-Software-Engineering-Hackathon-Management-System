import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HistoryIcon from "@mui/icons-material/History";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import { Alert, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { teamApi } from "@/api/team.api";
import type { EventCompetitionRoundResponse } from "@/types/team.types";

import { useTeamAdvancementStatusQuery } from "@/features/advancement/hooks/useAdvancementQueries";
import { TeamAdvancementStatusBanner } from "@/features/advancement/components/TeamAdvancementStatusBanner";
import { SubmissionRequirementsPanel } from "@/features/submissions/components/SubmissionRequirementsPanel";
import { useSubmissionRequirementsQuery } from "@/features/submissions/hooks/useParticipantSubmissionQueries";
import { CompetitionRoundTimeline } from "@/features/teams/components/CompetitionRoundTimeline";

import { SavedEvidencePanel } from "@/features/teams/components/SavedEvidencePanel";
import {
  getCountdownState,
  roundElapsedPercent,
} from "@/features/teams/utils/competitionTiming";
import { RoundCountdown } from "../components/RoundCountDown";

function formatDateTime(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function roundStateLabel(round: EventCompetitionRoundResponse) {
  if (round.submissionLocked) return "Submission locked";
  if (round.open) return "Accepting submissions";
  if (round.status === "UPCOMING") return "Not started";
  return round.status.replaceAll("_", " ");
}

export function EventCompetitionPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [clock, setClock] = useState(() => Date.now());
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const lastOpenRoundId = useRef<string | null>(null);

  const competitionQuery = useQuery({
    queryKey: ["event-competition", eventId],
    queryFn: () => teamApi.getMyEventCompetition(eventId!),
    enabled: Boolean(eventId),
    refetchInterval: 5000,
  });

  const competition = competitionQuery.data;

  const advancementQuery = useTeamAdvancementStatusQuery(
    competition?.teamId ?? "",
  );
  const advancementData = advancementQuery.data?.data;

  useEffect(() => {
    const interval = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!competition?.rounds?.length) return;

    const openRound = competition.rounds.find((round) => round.open);
    const openRoundId = openRound?.roundId ?? null;
    const nextRoundId =
      openRoundId && openRoundId !== lastOpenRoundId.current
        ? openRoundId
        : selectedRoundId || (openRound ?? competition.rounds[0]).roundId;

    lastOpenRoundId.current = openRoundId;
    if (nextRoundId !== selectedRoundId) {
      // Polling is the external source that advances the selected competition round.
      setSelectedRoundId(nextRoundId);
    }
  }, [competition, selectedRoundId]);

  const serverOffset = competition
    ? new Date(competition.serverTime).getTime() -
      competitionQuery.dataUpdatedAt
    : 0;
  const currentTime = clock + serverOffset;

  const selectedRound = useMemo(() => {
    if (!competition?.rounds?.length) return null;
    return (
      competition.rounds.find((round) => round.roundId === selectedRoundId) ??
      competition.rounds[0]
    );
  }, [competition, selectedRoundId]);

  const requirementsQuery = useSubmissionRequirementsQuery(
    competition?.teamId,
    selectedRound?.roundId,
  );

  const handleBack = () => {
    if (location.state?.fromInternal) {
      navigate(-1);
    } else {
      navigate("/participant/teams");
    }
  };

  if (competitionQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <CircularProgress />
      </div>
    );
  }

  if (competitionQuery.isError || !competition) {
    return (
      <div className="mx-auto max-w-3xl space-y-5 py-24">
        <Alert severity="warning">
          You can view the event competing page only after your team has
          registered to a track and the event is ongoing.
        </Alert>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <ArrowBackIcon style={{ fontSize: 16 }} />
          Go back
        </button>
      </div>
    );
  }

  const canOpenSubmission = Boolean(
    requirementsQuery.data?.canView &&
      !requirementsQuery.isLoading &&
      !requirementsQuery.isError,
  );

  const openSubmissionPage = () =>
    navigate(
      `/participant/teams/${competition.teamId}/rounds/${selectedRound?.roundId}/submission`,
    );

  const savedEvidence = requirementsQuery.data?.currentSubmission?.links;

  const countdown = getCountdownState(selectedRound, currentTime);
  const elapsed = selectedRound
    ? roundElapsedPercent(selectedRound, currentTime)
    : null;

  const statusNotice =
    competition.teamStatus === "ELIMINATED"
      ? {
          severity: "error" as const,
          message:
            "Your team has been eliminated and can no longer participate in this event.",
        }
      : competition.teamStatus === "ADVANCED"
        ? {
            severity: "success" as const,
            message:
              "Your team has advanced. You are eligible for the next round when it opens.",
          }
        : competition.teamStatus === "WINNER"
          ? {
              severity: "success" as const,
              message: "Congratulations — your team has won this event.",
            }
          : null;

  const stats = [
    {
      label: "Submission",
      value: selectedRound?.submissionStatus ?? "Not submitted",
    },
    { label: "Attempt", value: `#${selectedRound?.submissionNumber ?? 0}` },
    { label: "Links", value: `${selectedRound?.linkCount ?? 0}` },
  ];

  return (
    <div className="space-y-6 pb-4">
      {/* ── Context bar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
        >
          <ArrowBackIcon style={{ fontSize: 16 }} />
          Back to my teams
        </button>

        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-gray-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <GroupsOutlinedIcon style={{ fontSize: 14 }} />
            {competition.teamName}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-gray-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <CategoryOutlinedIcon style={{ fontSize: 14 }} />
            {competition.trackName}
          </span>
        </div>
      </div>

      {/* ── Mission control ─────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              Now competing
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              {competition.eventName}
            </h1>

            {selectedRound && (
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-base font-semibold text-gray-700 dark:text-slate-200">
                  {selectedRound.roundName}
                </span>
                <span
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                    selectedRound.open
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : selectedRound.submissionLocked
                        ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
                        : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300",
                  ].join(" ")}
                >
                  {selectedRound.open ? (
                    <span className="relative flex size-1.5">
                      <span className="absolute inline-flex size-full rounded-full bg-emerald-500 opacity-75 motion-safe:animate-ping" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                    </span>
                  ) : (
                    <LockOutlinedIcon style={{ fontSize: 13 }} />
                  )}
                  {roundStateLabel(selectedRound)}
                </span>
              </div>
            )}

            {selectedRound && (
              <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
                {formatDateTime(selectedRound.startAt)} →{" "}
                {formatDateTime(selectedRound.endAt)}
              </p>
            )}

            {elapsed !== null && (
              <div className="mt-5 max-w-md">
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800"
                  role="progressbar"
                  aria-label="Round progress"
                  aria-valuenow={Math.round(elapsed)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={[
                      "h-full rounded-full transition-[width] duration-500",
                      countdown.urgency === "critical"
                        ? "bg-red-500"
                        : countdown.urgency === "warning"
                          ? "bg-amber-500"
                          : "bg-blue-500",
                    ].join(" ")}
                    style={{ width: `${elapsed}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-400 dark:text-slate-500">
                  <span>Round opened</span>
                  <span>{Math.round(elapsed)}% elapsed</span>
                  <span>Deadline</span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <RoundCountdown
              state={countdown}
              deadlineLabel={formatDateTime(selectedRound?.submissionDeadline)}
            />
          </div>
        </div>
      </section>

      {/* ── Status notices ──────────────────────────────────────────── */}
      {statusNotice && (
        <Alert severity={statusNotice.severity}>{statusNotice.message}</Alert>
      )}
      {advancementData && (
        <TeamAdvancementStatusBanner
          status={advancementData.status}
          message={advancementData.message}
          nextRoundId={advancementData.nextRoundId}
          nextRoundName={advancementData.nextRoundName}
          canAccessNextRound={advancementData.canAccessNextRound}
          eventId={competition.eventId}
        />
      )}

      {/* ── Round rail ──────────────────────────────────────────────── */}
      {competition.rounds.length > 0 && (
        <CompetitionRoundTimeline
          rounds={competition.rounds}
          selectedRoundId={selectedRound?.roundId}
          onSelect={setSelectedRoundId}
        />
      )}

      {/* ── Work area ───────────────────────────────────────────────── */}
      {selectedRound ? (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,0.85fr)]">
          <div
            role="tabpanel"
            id={`round-panel-${selectedRound.roundId}`}
            aria-labelledby={`round-tab-${selectedRound.roundId}`}
            className="min-w-0 space-y-6"
          >
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <DescriptionOutlinedIcon style={{ fontSize: 17 }} />
                <h2 className="text-xs font-bold uppercase tracking-[0.18em]">
                  Round brief
                </h2>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-700 dark:text-slate-300">
                {selectedRound.description ||
                  "No exam instruction has been configured for this round yet. Please wait for the coordinator announcement."}
              </p>
              <p className="mt-5 border-t border-gray-100 pt-4 text-sm text-gray-500 dark:border-slate-800 dark:text-slate-400">
                Submission deadline{" "}
                <span className="font-medium text-gray-700 dark:text-slate-200">
                  {formatDateTime(selectedRound.submissionDeadline)}
                </span>
              </p>
            </section>

            {requirementsQuery.isLoading && (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-12 text-sm font-medium text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <CircularProgress size={18} />
                Loading submission requirements…
              </div>
            )}

            {requirementsQuery.isError && (
              <Alert
                severity="error"
                action={
                  <button
                    type="button"
                    onClick={() => requirementsQuery.refetch()}
                    className="cursor-pointer rounded px-2 py-1 text-xs font-bold uppercase"
                  >
                    Retry
                  </button>
                }
              >
                Submission requirements could not be loaded. The submission page
                remains disabled until the server contract is available.
              </Alert>
            )}

            {requirementsQuery.data && (
              <SubmissionRequirementsPanel
                requirements={requirementsQuery.data}
              />
            )}

            {savedEvidence && (
              <SavedEvidencePanel
                links={savedEvidence}
                onManage={openSubmissionPage}
              />
            )}
          </div>

          {/* Action rail */}
          <aside className="space-y-4 lg:sticky lg:top-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-slate-500">
                Your round status
              </h2>

              <dl className="mt-4 space-y-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800"
                  >
                    <dt className="text-sm text-gray-500 dark:text-slate-400">
                      {stat.label}
                    </dt>
                    <dd className="truncate text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  disabled={!canOpenSubmission}
                  onClick={openSubmissionPage}
                  className={[
                    "inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900",
                    canOpenSubmission
                      ? "cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
                      : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500",
                  ].join(" ")}
                >
                  <AssignmentTurnedInIcon style={{ fontSize: 17 }} />
                  Open submission page
                  <ArrowForwardIcon style={{ fontSize: 16 }} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/participant/teams/${competition.teamId}/submissions`,
                    )
                  }
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition-colors duration-200 hover:border-blue-400 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/60 dark:hover:text-blue-300 dark:focus-visible:ring-offset-slate-900"
                >
                  <HistoryIcon style={{ fontSize: 17 }} />
                  Submission history
                </button>
              </div>

              {!canOpenSubmission && !requirementsQuery.isLoading && (
                <p className="mt-3 text-xs leading-5 text-gray-400 dark:text-slate-500">
                  Submitting unlocks while the round is open and your team has
                  access to it.
                </p>
              )}
            </section>
          </aside>
        </div>
      ) : (
        <Alert severity="info">
          No round has been configured for this event yet.
        </Alert>
      )}
    </div>
  );
}
