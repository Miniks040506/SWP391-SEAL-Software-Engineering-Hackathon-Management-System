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
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { Alert, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { teamApi } from "@/api/team.api";
import { eventApi } from "@/api/event.api";
import { getSeasonLabel } from "@/features/events/utils/publicEventView";
import type { EventCompetitionRoundResponse } from "@/types/team.types";

import { useTeamAdvancementStatusQuery } from "@/features/advancement/hooks/useAdvancementQueries";
import { TeamAdvancementStatusBanner } from "@/features/advancement/components/TeamAdvancementStatusBanner";
import { SubmissionRequirementsPanel } from "@/features/submissions/components/SubmissionRequirementsPanel";
import { useSubmissionRequirementsQuery } from "@/features/submissions/hooks/useParticipantSubmissionQueries";
import { CompetitionRoundTimeline } from "@/features/teams/components/CompetitionRoundTimeline";

import { SavedEvidencePanel } from "@/features/teams/components/SavedEvidencePanel";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  getCountdownState,
  roundElapsedPercent,
} from "@/features/teams/utils/competitionTiming";
import "../styles/eventCompetition.css";

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
  const [bannerFailed, setBannerFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const [showOpenSheen, setShowOpenSheen] = useState(false);
  const lastOpenRoundId = useRef<string | null>(null);
  const openSheenLatched = useRef(false);
  const { ref: briefRef, revealed: briefRevealed } =
    useScrollReveal<HTMLElement>();
  const { ref: requirementsRef, revealed: requirementsRevealed } =
    useScrollReveal();
  const { ref: evidenceRef, revealed: evidenceRevealed } = useScrollReveal();

  const competitionQuery = useQuery({
    queryKey: ["event-competition", eventId],
    queryFn: () => teamApi.getMyEventCompetition(eventId!),
    enabled: Boolean(eventId),
    refetchInterval: 5000,
  });

  // Event detail carries the banner + season metadata the competition payload omits.
  const eventQuery = useQuery({
    queryKey: ["event-detail", eventId],
    queryFn: () => eventApi.getEventById(eventId!),
    enabled: Boolean(eventId),
    staleTime: 60_000,
  });

  const competition = competitionQuery.data;
  const event = eventQuery.data;

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

  const canOpenSubmission = Boolean(
    requirementsQuery.data?.canView &&
      !requirementsQuery.isLoading &&
      !requirementsQuery.isError,
  );

  useEffect(() => {
    if (canOpenSubmission && !openSheenLatched.current) {
      openSheenLatched.current = true;
      setShowOpenSheen(true);
    }
  }, [canOpenSubmission]);

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

  const openSubmissionPage = () =>
    navigate(
      `/participant/teams/${competition.teamId}/rounds/${selectedRound?.roundId}/submission`,
    );

  const savedEvidence = requirementsQuery.data?.currentSubmission?.links;

  const countdown = getCountdownState(selectedRound, currentTime);
  const elapsed = selectedRound
    ? roundElapsedPercent(selectedRound, currentTime)
    : null;

  const bannerSrc =
    event?.bannerUrl && !bannerFailed
      ? event.bannerUrl
      : `https://picsum.photos/seed/seal-event-${competition.eventId}/1600/560`;

  // Banner scrim is always dark, so the countdown needs white-safe tones in both themes.
  const countdownTone: Record<string, string> = {
    calm: "text-white",
    warning: "text-amber-300",
    critical: "text-rose-300",
    idle: "text-slate-200",
    closed: "text-slate-200",
    over: "text-rose-300",
  };
  const countdownNote: Record<string, string> = {
    calm: "Time remaining to submit",
    warning: "Less than a day left — submit soon",
    critical: "Final hour — submit now",
    idle: "Timer starts when a coordinator opens this round",
    closed: "This round's submission window has closed",
    over: "The submission deadline has passed",
  };
  const countdownHeadline: Record<string, string> = {
    idle: "Standby",
    closed: "Closed",
    over: "Closed",
  };

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
      {/* ── Event banner hero ───────────────────────────────────────── */}
      <section className="ec-hero relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-xl dark:border-slate-800">
        <div className="absolute inset-0">
          {!fallbackFailed ? (
            <img
              src={bannerSrc}
              alt={`${competition.eventName} banner`}
              onError={() =>
                bannerSrc === event?.bannerUrl
                  ? setBannerFailed(true)
                  : setFallbackFailed(true)
              }
              className="ec-banner h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-blue-600 via-indigo-700 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/70 to-slate-950/35" />
        </div>

        <div className="relative flex flex-col gap-6 p-6 md:p-8">
          {/* Top row: back + team/track */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <ArrowBackIcon style={{ fontSize: 16 }} />
              Back to my teams
            </button>

            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-white/90 backdrop-blur-sm">
                <GroupsOutlinedIcon style={{ fontSize: 14 }} />
                {competition.teamName}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-white/90 backdrop-blur-sm">
                <CategoryOutlinedIcon style={{ fontSize: 14 }} />
                {competition.trackName}
              </span>
            </div>
          </div>

          {/* Main: identity + countdown */}
          <div className="grid gap-6 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="min-w-0">
              <div style={{ "--delay": "0ms" } as React.CSSProperties} className="ec-stagger flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-200 backdrop-blur-sm">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full rounded-full bg-emerald-300 opacity-75 motion-safe:animate-ping" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-300" />
                  </span>
                  Now competing
                </span>
                <span className="rounded-full border border-cyan-300/30 bg-cyan-400/15 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-100 backdrop-blur-sm">
                  {getSeasonLabel(event?.season, event?.year)}
                </span>
              </div>

              <h1 style={{ "--delay": "90ms" } as React.CSSProperties} className="ec-stagger mt-4 text-3xl font-black leading-tight tracking-tight text-white drop-shadow-md md:text-4xl">
                {competition.eventName}
              </h1>

              {selectedRound && (
                <div style={{ "--delay": "170ms" } as React.CSSProperties} className="ec-stagger mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="text-base font-semibold text-white drop-shadow-sm">
                    {selectedRound.roundName}
                  </span>
                  <span
                    className={[
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm",
                      selectedRound.open
                        ? "border border-emerald-300/30 bg-emerald-400/15 text-emerald-200"
                        : selectedRound.submissionLocked
                          ? "border border-rose-300/30 bg-rose-400/15 text-rose-200"
                          : "border border-white/15 bg-white/10 text-slate-200",
                    ].join(" ")}
                  >
                    {selectedRound.open ? (
                      <span className="relative flex size-1.5">
                        <span className="absolute inline-flex size-full rounded-full bg-emerald-300 opacity-75 motion-safe:animate-ping" />
                        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-300" />
                      </span>
                    ) : (
                      <LockOutlinedIcon style={{ fontSize: 13 }} />
                    )}
                    {roundStateLabel(selectedRound)}
                  </span>
                </div>
              )}

              {selectedRound && (
                <p style={{ "--delay": "240ms" } as React.CSSProperties} className="ec-stagger mt-3 text-sm text-slate-300">
                  {formatDateTime(selectedRound.startAt)} →{" "}
                  {formatDateTime(selectedRound.endAt)}
                </p>
              )}

              {elapsed !== null && (
                <div style={{ "--delay": "320ms" } as React.CSSProperties} className="ec-stagger mt-5 max-w-md">
                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-white/20"
                    role="progressbar"
                    aria-label="Round progress"
                    aria-valuenow={Math.round(elapsed)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${elapsed}%`,
                        "--elapsed": elapsed / 100,
                      } as React.CSSProperties}
                    >
                      <div
                        className={[
                          "ec-progress h-full w-full rounded-full",
                          countdown.urgency === "critical"
                            ? "bg-rose-400"
                            : countdown.urgency === "warning"
                              ? "bg-amber-400"
                              : "bg-blue-400",
                        ].join(" ")}
                        style={{ "--elapsed": 1 } as React.CSSProperties}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-slate-400">
                    <span>Round opened</span>
                    <span className="tabular-nums">
                      {Math.round(elapsed)}% elapsed
                    </span>
                    <span>Deadline</span>
                  </div>
                </div>
              )}
            </div>

            {/* Glass countdown panel */}
            <div className={`rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md ${countdown.urgency === "critical" ? "ec-critical" : countdown.urgency === "warning" ? "ec-warning" : "ec-panel"}`}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                Submission window
              </p>

              <div
                className="mt-3 flex items-end gap-3"
                role="timer"
                aria-live="off"
                aria-label={
                  countdown.parts.length > 0
                    ? `Time remaining: ${countdown.parts
                        .map((part) => `${Number(part.value)} ${part.label}`)
                        .join(", ")}`
                    : countdownNote[countdown.urgency]
                }
              >
                {countdown.parts.length > 0 ? (
                  countdown.parts.map((part, index) => (
                    <div key={part.label} style={{ "--i": index } as React.CSSProperties} className="ec-digit flex items-end gap-3">
                      {index > 0 && (
                        <span
                          aria-hidden
                          className="pb-3 text-3xl font-light text-white/30"
                        >
                          :
                        </span>
                      )}
                      <div>
                        <p
                          className={[
                            "text-4xl font-semibold tabular-nums tracking-tight md:text-5xl",
                            countdownTone[countdown.urgency],
                          ].join(" ")}
                        >
                          <span key={part.value} className="ec-tick">{part.value}</span>
                        </p>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
                          {part.label}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p
                    className={[
                      "text-3xl font-semibold tracking-tight md:text-4xl",
                      countdownTone[countdown.urgency],
                    ].join(" ")}
                  >
                    {countdownHeadline[countdown.urgency] ?? ""}
                  </p>
                )}
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-sm text-white/70">
                <ScheduleOutlinedIcon style={{ fontSize: 15 }} />
                <span>
                  {countdownNote[countdown.urgency]}
                  {countdown.parts.length > 0 && (
                    <>
                      {" · "}
                      <span className="font-medium text-white/90">
                        {formatDateTime(selectedRound?.submissionDeadline)}
                      </span>
                    </>
                  )}
                </span>
              </p>
            </div>
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
        <div className="ec-timeline">
          <CompetitionRoundTimeline
            rounds={competition.rounds}
            selectedRoundId={selectedRound?.roundId}
            onSelect={setSelectedRoundId}
          />
        </div>
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
            <section
              ref={briefRef}
              className={`${briefRevealed ? "ec-reveal" : "ec-reveal-idle"} rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900`}
            >
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
              <div
                ref={requirementsRef}
                style={{ "--delay": "80ms" } as React.CSSProperties}
                className={requirementsRevealed ? "ec-reveal" : "ec-reveal-idle"}
              >
                <SubmissionRequirementsPanel requirements={requirementsQuery.data} />
              </div>
            )}

            {savedEvidence && (
              <div
                ref={evidenceRef}
                style={{ "--delay": "160ms" } as React.CSSProperties}
                className={evidenceRevealed ? "ec-reveal" : "ec-reveal-idle"}
              >
                <SavedEvidencePanel links={savedEvidence} onManage={openSubmissionPage} />
              </div>
            )}
          </div>

          {/* Action rail */}
          <aside className="ec-aside space-y-4 lg:sticky lg:top-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-slate-500">
                Your round status
              </h2>

              <dl className="mt-4 space-y-3">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    style={{ "--i": index } as React.CSSProperties}
                    className="ec-stat flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800"
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
                    `inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-colors duration-200 ${showOpenSheen ? "ec-open" : ""}`,
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
