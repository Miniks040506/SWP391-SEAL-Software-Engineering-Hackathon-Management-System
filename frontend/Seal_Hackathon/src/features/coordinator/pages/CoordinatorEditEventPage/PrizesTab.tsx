import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Alert, Button, CircularProgress, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useState, useMemo } from "react";

import { useCoordinatorPrizesQuery } from "../../hooks/useCoordinatorPrizeQueries";
import { useCoordinatorPrizeMutations } from "../../hooks/useCoordinatorPrizeMutations";
import { useCoordinatorMultipleTeamsQueries } from "../../hooks/useCoordinatorEventQueries";

import { PrizeSetupTable } from "../../components/prizes/PrizeSetupTable";
import { PrizeFormDialog } from "../../components/prizes/PrizeFormDialog";
import { DeletePrizeConfirmDialog } from "../../components/prizes/DeletePrizeConfirmDialog";

import { AwardManagementTable } from "../../components/prizes/AwardManagementTable";
import { ManualAwardDialog } from "../../components/prizes/ManualAwardDialog";
import { ClearAwardConfirmDialog } from "../../components/prizes/ClearAwardConfirmDialog";
import { PrizeFilterBar, defaultPrizeFilters, applyPrizeFilters } from "../../components/prizes/PrizeFilterBar";
import type { PrizeFilterState } from "../../components/prizes/PrizeFilterBar";

import type { UUID } from "@/types/common.types";
import type { PrizeResponse } from "@/types/prize.types";
import type { TrackResponse } from "@/types/track.types";
import type { PrizeFormValues, ManualAwardFormValues, ClearAwardFormValues } from "../../schemas/prize.schema";

type PrizesTabProps = {
  eventId: UUID;
  tracks: TrackResponse[];
  prizes: PrizeResponse[];
  isLoading: boolean;
  onChanged: () => void | Promise<void>;
  canEdit: boolean;
  readonlyReason?: string;
};

export function PrizesTab({
  eventId,
  tracks,
  canEdit,
  readonlyReason,
}: PrizesTabProps) {
  // Use the mock-aware hook instead of prizeApi directly
  const { data: prizes = [], isLoading } = useCoordinatorPrizesQuery(eventId);
  const { createPrize, updatePrize, deletePrize, manualAward, clearAward } = useCoordinatorPrizeMutations(eventId);

  const teamsQuery = useCoordinatorMultipleTeamsQueries([eventId]);
  const teams = teamsQuery[0]?.data?.content || [];

  const [viewMode, setViewMode] = useState<"SETUP" | "AWARD">("SETUP");
  const [filters, setFilters] = useState<PrizeFilterState>(defaultPrizeFilters);

  const filteredPrizes = useMemo(() => applyPrizeFilters(prizes, filters), [prizes, filters]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<PrizeResponse | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [prizeToDelete, setPrizeToDelete] = useState<PrizeResponse | null>(null);

  const [isManualAwardOpen, setIsManualAwardOpen] = useState(false);
  const [selectedPrizeForAward, setSelectedPrizeForAward] = useState<PrizeResponse | null>(null);
  const [isClearAwardOpen, setIsClearAwardOpen] = useState(false);
  const [selectedPrizeForClear, setSelectedPrizeForClear] = useState<PrizeResponse | null>(null);
  const manualAwardTeams = useMemo(
    () =>
      selectedPrizeForAward?.trackId
        ? teams.filter((team) => team.trackId === selectedPrizeForAward.trackId)
        : teams,
    [selectedPrizeForAward, teams],
  );

  const isLocked = !canEdit;

  const handleOpenCreate = () => {
    setSelectedPrize(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prize: PrizeResponse) => {
    setSelectedPrize(prize);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedPrize(null);
  };

  const handleFormSubmit = (values: PrizeFormValues) => {
    if (selectedPrize) {
      const { trackId, value, currency, ...rest } = values;
      updatePrize.mutate(
        {
          prizeId: selectedPrize.id,
          payload: { ...rest, value: value ?? undefined, currency: currency ?? undefined },
        },
        { onSuccess: handleCloseForm }
      );
    } else {
      const { trackId, value, currency, ...rest } = values;
      createPrize.mutate(
        {
          ...rest,
          eventId,
          trackId: trackId || undefined,
          value: value ?? undefined,
          currency: currency ?? undefined,
        },
        { onSuccess: handleCloseForm }
      );
    }
  };

  const handleOpenDelete = (prize: PrizeResponse) => {
    setPrizeToDelete(prize);
    setIsDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteOpen(false);
    setPrizeToDelete(null);
  };

  const handleDeleteConfirm = (prizeId: string) => {
    deletePrize.mutate(prizeId, { onSuccess: handleCloseDelete });
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

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">Prizes</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Configure prizes for the whole event or a specific track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {viewMode === "SETUP" && (
            <Button
              variant="contained"
              startIcon={isLocked ? <LockOutlinedIcon /> : <AddOutlinedIcon />}
              onClick={handleOpenCreate}
              disabled={isLocked}
              sx={{
                bgcolor: "#2563eb",
                borderRadius: "12px",
                px: 2.5,
                py: 1,
                textTransform: "none",
                fontWeight: 900,
                flexShrink: 0,
                "&:hover": { bgcolor: "#1d4ed8" },
                "&:disabled": { bgcolor: "#e2e8f0" },
              }}
            >
              {isLocked ? "Locked" : "Create Prize"}
            </Button>
          )}

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
            size="small"
            sx={{ bgcolor: "white" }}
          >
            <ToggleButton value="SETUP" sx={{ textTransform: "none", fontWeight: 600, px: 3 }}>
              Setup
            </ToggleButton>
            <ToggleButton value="AWARD" sx={{ textTransform: "none", fontWeight: 600, px: 3 }}>
              Awards
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>

      {/* Alerts */}
      {!canEdit && readonlyReason && (
        <Alert severity="warning" sx={{ borderRadius: "12px" }}>{readonlyReason}</Alert>
      )}

      {canEdit && prizes.length === 0 && !isLoading && (
        <Alert severity="warning" sx={{ borderRadius: "12px", fontWeight: 600 }}>
          No prizes configured yet. Add prizes before publishing results.
        </Alert>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <CircularProgress />
        </div>
      )}

      {/* Prize table */}
      {!isLoading && (
        <div className="rounded-2xl border border-slate-200 shadow-sm dark:border-slate-700">
          <PrizeFilterBar filters={filters} onChange={setFilters} tracks={tracks} />
          {viewMode === "SETUP" ? (
            <PrizeSetupTable
              prizes={filteredPrizes}
              isLocked={isLocked}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ) : (
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
          )}
        </div>
      )}

      {/* Dialogs */}
      <PrizeFormDialog
        open={isFormOpen}
        tracks={tracks}
        initialPrize={selectedPrize}
        isSubmitting={createPrize.isPending || updatePrize.isPending}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      <DeletePrizeConfirmDialog
        open={isDeleteOpen}
        prize={prizeToDelete}
        isDeleting={deletePrize.isPending}
        onClose={handleCloseDelete}
        onConfirm={handleDeleteConfirm}
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
    </section>
  );
}
