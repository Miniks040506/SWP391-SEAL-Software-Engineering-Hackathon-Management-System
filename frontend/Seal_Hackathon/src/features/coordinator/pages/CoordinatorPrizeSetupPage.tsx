import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, CircularProgress, Alert } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useCoordinatorEventDetailQuery, useCoordinatorEventTracksQuery } from "../hooks/useCoordinatorEventQueries";
import { useCoordinatorPrizesQuery } from "../hooks/useCoordinatorPrizeQueries";
import { useCoordinatorPrizeMutations } from "../hooks/useCoordinatorPrizeMutations";

import { PrizeSetupTable } from "../components/prizes/PrizeSetupTable";
import { PrizeFormDialog } from "../components/prizes/PrizeFormDialog";
import { DeletePrizeConfirmDialog } from "../components/prizes/DeletePrizeConfirmDialog";
import type { PrizeResponse } from "@/types/prize.types";
import type { PrizeFormValues } from "../schemas/prize.schema";

export const CoordinatorPrizeSetupPage = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const { data: event, isLoading: isLoadingEvent } = useCoordinatorEventDetailQuery(eventId);
  const { data: tracks = [], isLoading: isLoadingTracks } = useCoordinatorEventTracksQuery(eventId);
  const { data: prizes = [], isLoading: isLoadingPrizes } = useCoordinatorPrizesQuery(eventId);

  const { createPrize, updatePrize, deletePrize } = useCoordinatorPrizeMutations(eventId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<PrizeResponse | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [prizeToDelete, setPrizeToDelete] = useState<PrizeResponse | null>(null);

  const isLoading = isLoadingEvent || isLoadingTracks || isLoadingPrizes;

  const isLocked = ["JUDGING", "COMPLETED", "CANCELLED", "ARCHIVED", "PUBLISHED"]
    .includes(event?.status ?? "");

  const handleOpenCreateForm = () => {
    setSelectedPrize(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (prize: PrizeResponse) => {
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
          payload: {
            ...rest,
            value: value ?? undefined,
            currency: currency ?? undefined,
          }
        },
        { onSuccess: handleCloseForm }
      );
    } else {
      if (!eventId) return;
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
    deletePrize.mutate(prizeId, {
      onSuccess: handleCloseDelete,
    });
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
      <Alert severity="error" sx={{ borderRadius: "12px" }}>Event not found.</Alert>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white">
            Prize Setup
          </h1>
          <p className="mt-2 text-base font-medium text-slate-500 dark:text-slate-400">
            Configure prizes for <span className="font-bold text-slate-700 dark:text-slate-200">{event.name}</span>
          </p>
        </div>

        <Button
          variant="contained"
          startIcon={isLocked ? <LockOutlinedIcon /> : <AddOutlinedIcon />}
          onClick={handleOpenCreateForm}
          disabled={isLocked}
          sx={{
            bgcolor: "#2563eb",
            borderRadius: "12px",
            px: 3,
            py: 1.2,
            textTransform: "none",
            fontWeight: 900,
            "&:hover": { bgcolor: "#1d4ed8" },
            "&:disabled": { bgcolor: "#e2e8f0" },
          }}
        >
          {isLocked ? "Locked" : "Create Prize"}
        </Button>
      </header>

      {prizes.length === 0 && !isLocked && (
        <Alert severity="warning" sx={{ borderRadius: "12px", fontWeight: 600 }}>
          No prizes have been configured for this event. Configure prizes before publishing results.
        </Alert>
      )}

      {isLocked && (
        <Alert severity="info" sx={{ borderRadius: "12px", fontWeight: 600 }}>
          Prize setup is locked because the event results have been published.
        </Alert>
      )}

      <PrizeSetupTable
        prizes={prizes}
        isLocked={isLocked}
        onEdit={handleOpenEditForm}
        onDelete={handleOpenDelete}
      />

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
    </div>
  );
};
