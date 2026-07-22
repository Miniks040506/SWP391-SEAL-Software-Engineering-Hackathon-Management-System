import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Alert, CircularProgress } from "@mui/material";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useCoordinatorPrizesQuery } from "../../hooks/useCoordinatorPrizeQueries";
import { useCoordinatorPrizeMutations } from "../../hooks/useCoordinatorPrizeMutations";

import { PrizeSetupTable } from "../../components/prizes/PrizeSetupTable";
import { PrizeFormDialog } from "../../components/prizes/PrizeFormDialog";
import { DeletePrizeConfirmDialog } from "../../components/prizes/DeletePrizeConfirmDialog";

import { PrizeFilterBar, defaultPrizeFilters, applyPrizeFilters } from "../../components/prizes/PrizeFilterBar";
import type { PrizeFilterState } from "../../components/prizes/PrizeFilterBar";

import type { UUID } from "@/types/common.types";
import type { PrizeResponse } from "@/types/prize.types";
import type { TrackResponse } from "@/types/track.types";
import type { PrizeFormValues } from "../../schemas/prize.schema";

import { TabShell } from "./TabShell";

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
  const navigate = useNavigate();
  // Use the mock-aware hook instead of prizeApi directly
  const { data: prizes = [], isLoading } = useCoordinatorPrizesQuery(eventId);
  const { createPrize, updatePrize, deletePrize } = useCoordinatorPrizeMutations(eventId);

  const [filters, setFilters] = useState<PrizeFilterState>(defaultPrizeFilters);

  const filteredPrizes = useMemo(() => applyPrizeFilters(prizes, filters), [prizes, filters]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<PrizeResponse | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [prizeToDelete, setPrizeToDelete] = useState<PrizeResponse | null>(null);

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  return (
    <TabShell
      tab="PRIZES"
      title="Prize Setup"
      description="Configure prizes for the whole event or a specific track. Winners are assigned on the dedicated Awards page."
      headerActions={
        <>
          <button
            type="button"
            onClick={() => navigate(`/coordinator/events/${eventId}/awards`)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <EmojiEventsOutlinedIcon sx={{ fontSize: 17 }} />
            Award Management
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            disabled={isLocked}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-amber-500/25 transition-all duration-200 hover:from-amber-400 hover:to-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
          >
            {isLocked ? (
              <LockOutlinedIcon sx={{ fontSize: 17 }} />
            ) : (
              <AddOutlinedIcon sx={{ fontSize: 17 }} />
            )}
            {isLocked ? "Locked" : "Create Prize"}
          </button>
        </>
      }
      bodyClassName="space-y-5 px-7 py-6"
    >
      {/* Alerts */}
      {!canEdit && readonlyReason && (
        <Alert severity="warning" sx={{ borderRadius: "14px" }}>{readonlyReason}</Alert>
      )}

      {canEdit && prizes.length === 0 && !isLoading && (
        <Alert severity="warning" sx={{ borderRadius: "14px", fontWeight: 600 }}>
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
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
          <PrizeFilterBar filters={filters} onChange={setFilters} tracks={tracks} />
          <PrizeSetupTable
            prizes={filteredPrizes}
            isLocked={isLocked}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
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
    </TabShell>
  );
}
