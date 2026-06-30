import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, CircularProgress, Alert } from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

import {
  useCoordinatorEventDetailQuery,
  useCoordinatorEventTracksQuery,
  useCoordinatorEventRoundsQuery,
  useCoordinatorMultipleTeamsQueries
} from "../hooks/useCoordinatorEventQueries";
import { useCoordinatorPrizesQuery } from "../hooks/useCoordinatorPrizeQueries";
import { useCoordinatorPrizeMutations } from "../hooks/useCoordinatorPrizeMutations";

import { AssignPrizesFromRankingDialog } from "../components/prizes/AssignPrizesFromRankingDialog";
import { ManualAwardDialog } from "../components/prizes/ManualAwardDialog";
import { ClearAwardConfirmDialog } from "../components/prizes/ClearAwardConfirmDialog";
import { PrizeScopeBadge } from "../components/prizes/PrizeScopeBadge";
import { PrizeValueDisplay } from "../components/prizes/PrizeValueDisplay";
import { AwardedTeamChip } from "../components/prizes/AwardedTeamChip";

import type { PrizeResponse } from "@/types/prize.types";
import type { AssignPrizesFromRankingFormValues, ManualAwardFormValues, ClearAwardFormValues } from "../schemas/prize.schema";

type StatCardProps = {
  label: string;
  value: string | number;
  colorClass: string;
};

function StatCard({ label, value, colorClass }: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-5 ${colorClass}`}>
      <p className="text-sm font-bold uppercase tracking-widest opacity-70">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </div>
  );
}

export const CoordinatorAwardManagementPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const { data: event, isLoading: isLoadingEvent } = useCoordinatorEventDetailQuery(eventId);
  const { data: prizes = [], isLoading: isLoadingPrizes, refetch: refetchPrizes, isRefetching } = useCoordinatorPrizesQuery(eventId);
  const { data: tracks = [] } = useCoordinatorEventTracksQuery(eventId);
  const { data: rounds = [] } = useCoordinatorEventRoundsQuery(eventId);

  const teamsQuery = useCoordinatorMultipleTeamsQueries(eventId ? [eventId] : []);
  const teams = teamsQuery[0]?.data?.content || [];

  const { assignFromRanking, manualAward, clearAward } = useCoordinatorPrizeMutations(eventId);

  const totalPrizes = prizes.length;
  const awardedPrizes = prizes.filter((p) => p.awardedTeamId).length;
  const unawardedPrizes = totalPrizes - awardedPrizes;

  const lastAssignedAt = useMemo(() => {
    const awarded = prizes.filter(p => p.awardedAt).map(p => new Date(p.awardedAt!).getTime());
    if (awarded.length === 0) return null;
    return new Date(Math.max(...awarded)).toLocaleDateString();
  }, [prizes]);

  const [isAutoAssignOpen, setIsAutoAssignOpen] = useState(false);
  const [isManualAwardOpen, setIsManualAwardOpen] = useState(false);
  const [selectedPrizeForAward, setSelectedPrizeForAward] = useState<PrizeResponse | null>(null);
  const [isClearAwardOpen, setIsClearAwardOpen] = useState(false);
  const [selectedPrizeForClear, setSelectedPrizeForClear] = useState<PrizeResponse | null>(null);

  const isLoading = isLoadingEvent || isLoadingPrizes;

  const handleAutoAssignSubmit = (values: AssignPrizesFromRankingFormValues) => {
    assignFromRanking.mutate(values, {
      onSuccess: () => setIsAutoAssignOpen(false),
    });
  };

  const handleManualAwardSubmit = (values: ManualAwardFormValues) => {
    if (!selectedPrizeForAward) return;
    manualAward.mutate(
      { prizeId: selectedPrizeForAward.id, payload: values },
      { onSuccess: () => setIsManualAwardOpen(false) }
    );
  };

  const handleClearAwardSubmit = (values: ClearAwardFormValues) => {
    if (!selectedPrizeForClear) return;
    clearAward.mutate(
      { prizeId: selectedPrizeForClear.id, payload: values },
      { onSuccess: () => setIsClearAwardOpen(false) }
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
    return <Alert severity="error" sx={{ borderRadius: "12px" }}>Event not found.</Alert>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={() => navigate(`/coordinator/events/${eventId}/edit`)}
            sx={{ mb: 1, textTransform: "none", fontWeight: 800 }}
          >
            Back to Event
          </Button>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white">
            Award Management
          </h1>
          <p className="mt-2 text-base font-medium text-slate-500 dark:text-slate-400">
            Assign and manage prize winners for <span className="font-bold text-slate-700 dark:text-slate-200">{event.name}</span>
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RefreshOutlinedIcon />}
            onClick={() => refetchPrizes()}
            disabled={isRefetching}
            sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none" }}
          >
            {isRefetching ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            variant="contained"
            startIcon={<AutoFixHighOutlinedIcon />}
            onClick={() => setIsAutoAssignOpen(true)}
            sx={{
              bgcolor: "#2563eb",
              borderRadius: "10px",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
          >
            Auto Assign
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Prizes"
          value={totalPrizes}
          colorClass="border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <StatCard
          label="Awarded"
          value={awardedPrizes}
          colorClass="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
        />
        <StatCard
          label="Unawarded"
          value={unawardedPrizes}
          colorClass="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Last Awarded</p>
          <p className="mt-2 text-lg font-black text-slate-800 dark:text-white">{lastAssignedAt ?? "—"}</p>
        </div>
      </div>

      {/* Awards Table */}
      <section>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Rank</th>
                <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Scope</th>
                <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Prize Title</th>
                <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Value</th>
                <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Winner</th>
                <th className="px-5 py-3.5 text-center text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {prizes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm font-medium text-slate-400">
                    No prizes configured for this event.
                  </td>
                </tr>
              ) : (
                prizes.map((prize) => {
                  const isAwarded = Boolean(prize.awardedTeamId);
                  return (
                    <tr key={prize.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-4">
                        <span className="text-base font-black text-slate-700 dark:text-slate-200">
                          #{prize.rankPosition ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <PrizeScopeBadge trackName={prize.trackName} />
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900 dark:text-white">{prize.title}</span>
                      </td>
                      <td className="px-5 py-4">
                        <PrizeValueDisplay value={prize.value} currency={prize.currency} />
                      </td>
                      <td className="px-5 py-4">
                        <AwardedTeamChip teamName={prize.awardedTeamName} />
                        {prize.awardedAt && (
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {new Date(prize.awardedAt).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Manual Award"
                            onClick={() => {
                              setSelectedPrizeForAward(prize);
                              setIsManualAwardOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-600 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            <EmojiEventsOutlinedIcon sx={{ fontSize: 14 }} />
                            Award
                          </button>
                          <button
                            title="Clear Award"
                            disabled={!isAwarded}
                            onClick={() => {
                              setSelectedPrizeForClear(prize);
                              setIsClearAwardOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                          >
                            <ClearOutlinedIcon sx={{ fontSize: 14 }} />
                            Clear
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Dialogs */}
      <AssignPrizesFromRankingDialog
        open={isAutoAssignOpen}
        tracks={tracks}
        rounds={rounds}
        isSubmitting={assignFromRanking.isPending}
        onClose={() => setIsAutoAssignOpen(false)}
        onSubmit={handleAutoAssignSubmit}
      />

      <ManualAwardDialog
        open={isManualAwardOpen}
        prize={selectedPrizeForAward}
        teams={teams}
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
