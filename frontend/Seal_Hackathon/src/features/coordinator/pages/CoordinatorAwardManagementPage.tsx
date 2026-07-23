import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress, Alert } from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";

import {
  useCoordinatorEventDetailQuery,
  useCoordinatorEventTracksQuery,
  useCoordinatorEventRoundsQuery,
  useCoordinatorMultipleTeamsQueries,
} from "../hooks/useCoordinatorEventQueries";
import { useCoordinatorPrizesQuery } from "../hooks/useCoordinatorPrizeQueries";
import { useCoordinatorPrizeMutations } from "../hooks/useCoordinatorPrizeMutations";

import { AssignPrizesFromRankingDialog } from "../components/prizes/AssignPrizesFromRankingDialog";
import { ManualAwardDialog } from "../components/prizes/ManualAwardDialog";
import { ClearAwardConfirmDialog } from "../components/prizes/ClearAwardConfirmDialog";
import { AwardManagementTable } from "../components/prizes/AwardManagementTable";
import {
  PrizeFilterBar,
  defaultPrizeFilters,
  applyPrizeFilters,
} from "../components/prizes/PrizeFilterBar";
import type { PrizeFilterState } from "../components/prizes/PrizeFilterBar";

import type { PrizeResponse } from "@/types/prize.types";
import type { CoordinatorTeamSummaryResponse } from "@/types/team.types";
import type {
  AssignPrizesFromRankingFormValues,
  ManualAwardFormValues,
  ClearAwardFormValues,
} from "../schemas/prize.schema";

function HeroStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          accent,
        ].join(" ")}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xl font-black leading-none text-white tabular-nums">
          {value}
        </p>
        <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}

export const CoordinatorAwardManagementPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const { data: event, isLoading: isLoadingEvent } =
    useCoordinatorEventDetailQuery(eventId);
  const {
    data: prizeData,
    isLoading: isLoadingPrizes,
    refetch: refetchPrizes,
    isRefetching,
  } = useCoordinatorPrizesQuery(eventId);
  const prizes = useMemo(
    () => (prizeData ?? []) as PrizeResponse[],
    [prizeData],
  );
  const { data: tracks = [] } = useCoordinatorEventTracksQuery(eventId);
  const { data: rounds = [], isLoading: isLoadingRounds } =
    useCoordinatorEventRoundsQuery(eventId);

  const teamsQuery = useCoordinatorMultipleTeamsQueries(
    eventId ? [eventId] : [],
  );
  const teams = teamsQuery[0]?.data?.content;

  const { assignFromRanking, manualAward, clearAward } =
    useCoordinatorPrizeMutations(eventId);

  const totalPrizes = prizes.length;
  const awardedPrizes = prizes.filter((p) => p.awardedTeamId).length;
  const unawardedPrizes = totalPrizes - awardedPrizes;
  const awardedPct =
    totalPrizes > 0 ? Math.round((awardedPrizes / totalPrizes) * 100) : 0;

  // Total prize pool is a single event-level metric that stays constant regardless
  // of how many tracks the event has (2 or 30), so it always scales.
  const prizePool = useMemo(() => {
    const total = prizes.reduce((sum, p) => sum + (p.value ?? 0), 0);
    if (total <= 0) return "None";
    const currency = prizes.find((p) => (p.value ?? 0) > 0)?.currency ?? "";
    return `${total.toLocaleString()}${currency ? ` ${currency}` : ""}`;
  }, [prizes]);

  const [isAutoAssignOpen, setIsAutoAssignOpen] = useState(false);
  const [isManualAwardOpen, setIsManualAwardOpen] = useState(false);
  const [selectedPrizeForAward, setSelectedPrizeForAward] =
    useState<PrizeResponse | null>(null);
  const [isClearAwardOpen, setIsClearAwardOpen] = useState(false);
  const [selectedPrizeForClear, setSelectedPrizeForClear] =
    useState<PrizeResponse | null>(null);

  const [filters, setFilters] = useState<PrizeFilterState>(defaultPrizeFilters);
  const filteredPrizes = useMemo(
    () => applyPrizeFilters(prizes, filters),
    [prizes, filters],
  );
  const manualAwardTeams = useMemo(
    (): CoordinatorTeamSummaryResponse[] =>
      selectedPrizeForAward?.trackId
        ? (teams ?? []).filter(
            (team) => team.trackId === selectedPrizeForAward.trackId,
          )
        : (teams ?? []),
    [selectedPrizeForAward, teams],
  );

  const isLoading = isLoadingEvent || isLoadingPrizes || isLoadingRounds;

  const handleAutoAssignSubmit = (
    values: AssignPrizesFromRankingFormValues,
  ) => {
    assignFromRanking.mutate(values, {
      onSuccess: () => setIsAutoAssignOpen(false),
    });
  };

  const handleManualAwardSubmit = (values: ManualAwardFormValues) => {
    if (!selectedPrizeForAward) return;
    manualAward.mutate(
      { prizeId: selectedPrizeForAward.id, payload: values },
      { onSuccess: () => setIsManualAwardOpen(false) },
    );
  };

  const handleClearAwardSubmit = (values: ClearAwardFormValues) => {
    if (!selectedPrizeForClear) return;
    clearAward.mutate(
      { prizeId: selectedPrizeForClear.id, payload: values },
      { onSuccess: () => setIsClearAwardOpen(false) },
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (!event) {
    return (
      <Alert severity="error" sx={{ borderRadius: "12px" }}>
        Event not found.
      </Alert>
    );
  }

  const publishedRounds = event.resultPublishedAt
    ? rounds
    : rounds.filter((round) => round.resultPublishedAt);
  const canAssignPrizes = publishedRounds.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hero banner poster scales for any track count. */}
      <header className="relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-8">
        {/* Gold and blue glow for a celebratory prize theme. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-1/4 h-72 w-72 rounded-full bg-blue-600/25 blur-3xl"
        />
        {/* dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,0.5) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* decorative podium bars (pure decoration, not data-bound) */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 items-end gap-2 lg:flex"
        >
          <span className="h-16 w-8 rounded-t-lg bg-linear-to-t from-slate-500/40 to-slate-300/60" />
          <span className="h-24 w-8 rounded-t-lg bg-linear-to-t from-amber-500/50 to-amber-300/80" />
          <span className="h-12 w-8 rounded-t-lg bg-linear-to-t from-orange-700/40 to-orange-400/70" />
        </div>

        <div className="relative flex flex-col gap-6">
          {/* Top row: back + actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate(`/coordinator/events/${eventId}/edit`)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} />
              Back to Event
            </button>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => refetchPrizes()}
                disabled={isRefetching}
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-bold text-slate-200 backdrop-blur-sm transition-all hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:opacity-50"
              >
                <RefreshOutlinedIcon
                  sx={{ fontSize: 19 }}
                  className={isRefetching ? "animate-spin" : ""}
                />
                {isRefetching ? "Refreshing..." : "Refresh"}
              </button>
              <button
                type="button"
                onClick={() => setIsAutoAssignOpen(true)}
                disabled={!canAssignPrizes}
                title={
                  canAssignPrizes
                    ? "Assign prizes from published rankings"
                    : "Publish results before assigning prizes"
                }
                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 px-5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/30 transition-all hover:from-amber-300 hover:to-orange-400 hover:shadow-amber-400/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-600 disabled:text-slate-300 disabled:shadow-none motion-reduce:active:scale-100"
              >
                <AutoFixHighOutlinedIcon sx={{ fontSize: 20 }} />
                Auto Assign
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
              Coordinator Workspace · Awards
            </p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              <EmojiEventsOutlinedIcon
                sx={{ fontSize: 34 }}
                className="text-amber-300"
              />
              Award{" "}
              <span className="bg-linear-to-r from-amber-300 via-yellow-200 to-orange-300 bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-400 sm:text-base">
              Assign and manage prize winners for{" "}
              <span className="font-bold text-slate-200">{event.name}</span>.
            </p>
          </div>

          {/* Award progress */}
          <div className="max-w-xl">
            <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">Award progress</span>
              <span className="text-amber-300 tabular-nums">
                {awardedPrizes}/{totalPrizes} · {awardedPct}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-linear-to-r from-amber-400 to-emerald-400 transition-all duration-700 motion-reduce:transition-none"
                style={{ width: `${awardedPct}%` }}
              />
            </div>
          </div>

          {/* Fixed event-level summary. */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroStat
              icon={<EmojiEventsOutlinedIcon sx={{ fontSize: 19 }} />}
              label="Total prizes"
              value={totalPrizes}
              accent="bg-blue-500/20 text-blue-300"
            />
            <HeroStat
              icon={<EmojiEventsIcon sx={{ fontSize: 19 }} />}
              label="Awarded"
              value={awardedPrizes}
              accent="bg-emerald-500/20 text-emerald-300"
            />
            <HeroStat
              icon={<PendingActionsOutlinedIcon sx={{ fontSize: 19 }} />}
              label="Unawarded"
              value={unawardedPrizes}
              accent="bg-amber-500/20 text-amber-300"
            />
            <HeroStat
              icon={<SavingsOutlinedIcon sx={{ fontSize: 19 }} />}
              label="Prize pool"
              value={prizePool}
              accent="bg-violet-500/20 text-violet-300"
            />
          </div>
        </div>
      </header>

      {!canAssignPrizes && (
        <section
          aria-labelledby="publish-results-required"
          className="flex flex-col gap-4 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:ring-amber-500/30 sm:flex-row sm:items-center"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            <PublishOutlinedIcon />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="publish-results-required"
              className="text-base font-black text-amber-950 dark:text-amber-100"
            >
              Publish results before assigning prizes
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-amber-800 dark:text-amber-200/80">
              Lock grading, calculate the final ranking, and publish the event
              results. Award controls will unlock after publication.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/coordinator/events/${eventId}/rankings`)}
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-900 px-4 py-2.5 text-sm font-bold whitespace-nowrap text-amber-50 transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 active:scale-[0.98] dark:bg-amber-300 dark:text-amber-950 dark:hover:bg-amber-200"
          >
            <PublishOutlinedIcon sx={{ fontSize: 18 }} />
            Open rankings
          </button>
        </section>
      )}

      {/* Awards table scales with any number of prizes or tracks. */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <PrizeFilterBar
          filters={filters}
          onChange={setFilters}
          tracks={tracks}
        />
        <AwardManagementTable
          prizes={filteredPrizes}
          canAssignPrizes={canAssignPrizes}
          onManualAward={(prize) => {
            setSelectedPrizeForAward(prize);
            setIsManualAwardOpen(true);
          }}
          onClearAward={(prize) => {
            setSelectedPrizeForClear(prize);
            setIsClearAwardOpen(true);
          }}
        />
      </section>

      {/* Dialogs */}
      <AssignPrizesFromRankingDialog
        open={isAutoAssignOpen}
        tracks={tracks}
        rounds={publishedRounds}
        isSubmitting={assignFromRanking.isPending}
        onClose={() => setIsAutoAssignOpen(false)}
        onSubmit={handleAutoAssignSubmit}
      />

      <ManualAwardDialog
        open={isManualAwardOpen}
        prize={selectedPrizeForAward}
        teams={manualAwardTeams}
        isSubmitting={manualAward.isPending}
        onClose={() => setIsManualAwardOpen(false)}
        onSubmit={handleManualAwardSubmit}
      />

      <ClearAwardConfirmDialog
        open={isClearAwardOpen}
        prize={selectedPrizeForClear}
        isSubmitting={clearAward.isPending}
        onClose={() => setIsClearAwardOpen(false)}
        onSubmit={handleClearAwardSubmit}
      />
    </div>
  );
};
