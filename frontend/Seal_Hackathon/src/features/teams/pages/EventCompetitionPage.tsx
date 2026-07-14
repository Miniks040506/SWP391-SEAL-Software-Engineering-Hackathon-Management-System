import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import LockIcon from "@mui/icons-material/Lock";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { Alert, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { teamApi } from "@/api/team.api";
import type { EventCompetitionRoundResponse } from "@/types/team.types";

import { useTeamAdvancementStatusQuery } from "@/features/advancement/hooks/useAdvancementQueries";
import { TeamAdvancementStatusBanner } from "@/features/advancement/components/TeamAdvancementStatusBanner";

function formatDateTime(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCountdown(target: string | null | undefined, now: number) {
  if (!target) return "No deadline configured";

  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return "Deadline reached";

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function roundStateLabel(round: EventCompetitionRoundResponse) {
  if (round.submissionLocked) return "Submission locked";
  if (round.open) return "Running";
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

  if (competitionQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <CircularProgress />
      </div>
    );
  }

  const handleBack = () => {
    if (location.state?.fromInternal) {
      navigate(-1);
    } else {
      navigate("/participant/teams");
    }
  };

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
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 transition hover:border-blue-400 hover:text-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <ArrowBackIcon style={{ fontSize: 16 }} />
          Go Back
        </button>
      </div>
    );
  }

  const canOpenSubmission =
    selectedRound?.canSubmit && competition.teamStatus !== "ELIMINATED";

  return (
    <div className="space-y-7 animate-in slide-in-from-bottom-4 duration-500">
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-blue-500"
      >
        <ArrowBackIcon style={{ fontSize: 15 }} />
        Go Back
      </button>

      <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 to-slate-950 text-white shadow-xl shadow-blue-500/20">
        <div className="space-y-5 p-7 md:p-10">
          <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
            <RocketLaunchIcon style={{ fontSize: 18 }} />
            Event Competing
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                {competition.eventName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
                Team{" "}
                <span className="font-bold text-white">
                  {competition.teamName}
                </span>{" "}
                is competing in track{" "}
                <span className="font-bold text-white">
                  {competition.trackName}
                </span>
                . Watch round status here and submit deliverables when a
                coordinator opens a round.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-100">
                Current round timer
              </p>
              <p className="mt-2 text-3xl font-black">
                {selectedRound?.open
                  ? formatCountdown(
                      selectedRound.submissionDeadline,
                      currentTime,
                    )
                  : "Waiting"}
              </p>
              <p className="mt-1 text-xs font-medium text-blue-100">
                {selectedRound?.open
                  ? `Deadline: ${formatDateTime(selectedRound.submissionDeadline)}`
                  : "Timer starts when the coordinator opens a round."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {competition.teamStatus === "ELIMINATED" && (
        <Alert severity="error">
          Your team has been eliminated and can no longer participate in this
          event.
        </Alert>
      )}
      {competition.teamStatus === "ADVANCED" && (
        <Alert severity="success">
          Your team has advanced! You are eligible for the next round when it
          opens.
        </Alert>
      )}
      {competition.teamStatus === "WINNER" && (
        <Alert severity="success">
          Congratulations! Your team has won this event.
        </Alert>
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

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
        <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">
            Track rounds
          </h2>

          {competition.rounds.map((round) => (
            <button
              key={round.roundId}
              type="button"
              onClick={() => setSelectedRoundId(round.roundId)}
              className={[
                "w-full rounded-2xl border p-4 text-left transition-all",
                selectedRound?.roundId === round.roundId
                  ? "border-blue-400 bg-blue-50 shadow-md shadow-blue-100 dark:border-blue-500 dark:bg-blue-500/10 dark:shadow-none"
                  : "border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500/50",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-slate-100">
                    Round {round.orderIndex}: {round.roundName}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-slate-400">
                    {roundStateLabel(round)}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-slate-400">
                    {formatDateTime(round.startAt)} â†’{" "}
                    {formatDateTime(round.endAt)}
                  </p>
                </div>
                <span
                  className={[
                    "rounded-full px-2.5 py-1 text-[10px] font-black uppercase",
                    round.open
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : round.submissionLocked
                        ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                        : "bg-gray-200 text-gray-600 dark:bg-slate-800 dark:text-slate-300",
                  ].join(" ")}
                >
                  {round.status}
                </span>
              </div>

              {round.open && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-2.5 py-1 text-xs font-black text-blue-600 dark:bg-slate-900">
                  <AccessTimeIcon style={{ fontSize: 14 }} />
                  {formatCountdown(round.submissionDeadline, currentTime)}
                </p>
              )}
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {selectedRound ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5 dark:border-slate-800">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-blue-500">
                    Competition round
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
                    {selectedRound.roundName}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
                    Round period: {formatDateTime(selectedRound.startAt)} â†’{" "}
                    {formatDateTime(selectedRound.endAt)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-500 dark:text-slate-400">
                    Submission deadline:{" "}
                    {formatDateTime(selectedRound.submissionDeadline)}
                  </p>
                </div>

                <span
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase",
                    selectedRound.open
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : selectedRound.submissionLocked
                        ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                        : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300",
                  ].join(" ")}
                >
                  {selectedRound.open ? (
                    <PlayArrowIcon style={{ fontSize: 15 }} />
                  ) : (
                    <LockIcon style={{ fontSize: 15 }} />
                  )}
                  {roundStateLabel(selectedRound)}
                </span>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
                <p className="text-xs font-black uppercase tracking-widest text-blue-500">
                  Competing exam / round instruction
                </p>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-700 dark:text-slate-300">
                  {selectedRound.description ||
                    "No exam instruction has been configured for this round yet. Please wait for the coordinator announcement."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-black uppercase text-gray-400">
                    Submission status
                  </p>
                  <p className="mt-2 text-lg font-black text-gray-900 dark:text-white">
                    {selectedRound.submissionStatus ?? "Not submitted"}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-black uppercase text-gray-400">
                    Attempt
                  </p>
                  <p className="mt-2 text-lg font-black text-gray-900 dark:text-white">
                    #{selectedRound.submissionNumber ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-black uppercase text-gray-400">
                    Links
                  </p>
                  <p className="mt-2 text-lg font-black text-gray-900 dark:text-white">
                    {selectedRound.linkCount}
                  </p>
                </div>
              </div>

              {!competition.leader && (
                <Alert severity="info">
                  Only the team leader can submit or update deliverables. You
                  can still view round status and instructions here.
                </Alert>
              )}

              {selectedRound.submissionLocked && (
                <Alert severity="warning">
                  Submission is locked for this round. Your team can view
                  previous submissions but cannot update them.
                </Alert>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  disabled={!canOpenSubmission}
                  onClick={() =>
                    navigate(
                      `/participant/teams/${competition.teamId}/rounds/${selectedRound.roundId}/submission`,
                    )
                  }
                  className={[
                    "inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-black transition-all",
                    canOpenSubmission
                      ? "bg-blue-500 text-white shadow-md shadow-blue-100 hover:bg-blue-600 active:scale-95 dark:shadow-none"
                      : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500",
                  ].join(" ")}
                >
                  <AssignmentTurnedInIcon style={{ fontSize: 17 }} />
                  Go to submission page
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/participant/teams/${competition.teamId}/submissions`,
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-black text-gray-600 transition-all hover:border-blue-400 hover:text-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  View submission history
                </button>
              </div>
            </div>
          ) : (
            <Alert severity="info">
              No round has been configured for this event yet.
            </Alert>
          )}
        </section>
      </div>
    </div>
  );
}
