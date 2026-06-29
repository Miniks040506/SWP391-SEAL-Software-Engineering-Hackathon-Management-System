import { useState } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";

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

  const isLocked = event?.status === "PUBLISHED" || event?.status === "COMPLETED";

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
      createPrize.mutate(
        { ...values, eventId, trackId: values.trackId || undefined },
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Alert severity="error">Event not found.</Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prize Setup</h1>
          <p className="text-sm text-gray-500">
            {event.name} • {event.status}
          </p>
        </div>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateForm}
          disabled={isLocked}
          sx={{ fontWeight: "bold" }}
        >
          Create Prize
        </Button>
      </div>

      {prizes.length === 0 && !isLocked && (
        <Alert severity="warning">
          No prizes have been configured for this event. You should configure prizes before result publication.
        </Alert>
      )}

      {isLocked && (
        <Alert severity="info">
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
