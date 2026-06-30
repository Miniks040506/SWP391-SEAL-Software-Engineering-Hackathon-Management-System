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
import { AwardManagementTable } from "../components/prizes/AwardManagementTable";
import { PrizeFilterBar, defaultPrizeFilters, applyPrizeFilters } from "../components/prizes/PrizeFilterBar";
import type { PrizeFilterState } from "../components/prizes/PrizeFilterBar";

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

  const [filters, setFilters] = useState<PrizeFilterState>(defaultPrizeFilters);
  const filteredPrizes = useMemo(() => applyPrizeFilters(prizes, filters), [prizes, filters]);

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
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
        <PrizeFilterBar filters={filters} onChange={setFilters} tracks={tracks} />
        <AwardManagementTable
          prizes={filteredPrizes}
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
