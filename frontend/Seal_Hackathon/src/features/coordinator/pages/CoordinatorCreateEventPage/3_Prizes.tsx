import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import Button from "@mui/material/Button";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import type {
  CreateEventFormValues,
  PrizeFormValues,
} from "../../schemas/createEvent.schema";

import { PrizeCreateModal } from "./components/PrizeCreateModal";
import { PrizeTable } from "./components/PrizeTable";

type PrizesStepProps = {
  onBack: () => void;
  onNext: () => void;
};

export const PrizesStep = ({ onBack, onNext }: PrizesStepProps) => {
  const { control } = useFormContext<CreateEventFormValues>();

  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [editingPrizeIndex, setEditingPrizeIndex] = useState<number | null>(
    null,
  );

  const [lockedTrackId, setLockedTrackId] = useState<string | null>(null);
  const [isTrackLocked, setIsTrackLocked] = useState(false);

  const { append: appendPrize, update: updatePrize } = useFieldArray({
    control,
    name: "prizes",
    keyName: "fieldId",
  });

  const prizes = useWatch({
    control,
    name: "prizes",
  });

  const tracks = useWatch({
    control,
    name: "tracks",
  });

  const currentPrizes = prizes ?? [];
  const currentTracks = tracks ?? [];

  const editingPrize =
    editingPrizeIndex !== null ? currentPrizes[editingPrizeIndex] : null;

  const handleOpenGlobalCreateModal = () => {
    setEditingPrizeIndex(null);

    if (currentTracks.length === 0) {
      setLockedTrackId("");
      setIsTrackLocked(true);
    } else {
      setLockedTrackId(null);
      setIsTrackLocked(false);
    }

    setIsPrizeModalOpen(true);
  };

  const handleOpenTrackPrizeModal = (trackId: string) => {
    setEditingPrizeIndex(null);
    setLockedTrackId(trackId);
    setIsTrackLocked(true);
    setIsPrizeModalOpen(true);
  };

  const handleOpenEditModal = (prizeIndex: number) => {
    setEditingPrizeIndex(prizeIndex);
    setLockedTrackId(null);
    setIsTrackLocked(false);
    setIsPrizeModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPrizeModalOpen(false);
    setEditingPrizeIndex(null);
    setLockedTrackId(null);
    setIsTrackLocked(false);
  };

  const handleSavePrize = (prize: PrizeFormValues) => {
    if (editingPrizeIndex === null) {
      appendPrize(prize);
      return;
    }

    updatePrize(editingPrizeIndex, prize);
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-7 py-5">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">
            Step 3: Prizes
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add event-level or track-specific prizes. Track row actions will
            lock the prize to that track.
          </p>
        </div>

        <Button
          type="button"
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={handleOpenGlobalCreateModal}
          sx={{
            bgcolor: "white",
            color: "#2563eb",
            border: "1px solid #bfdbfe",
            fontWeight: 800,
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#eff6ff",
              boxShadow: "none",
            },
          }}
        >
          Add Prize
        </Button>
      </div>

      <div className="px-7 py-6">
        <PrizeTable
          prizes={currentPrizes}
          tracks={currentTracks}
          onAddTrackPrize={handleOpenTrackPrizeModal}
          onEditPrize={handleOpenEditModal}
        />
      </div>

      <div className="flex justify-between border-t border-gray-100 px-7 py-5">
        <Button type="button" variant="outlined" onClick={onBack}>
          Back
        </Button>

        <Button
          type="button"
          variant="contained"
          endIcon={<ArrowForwardOutlinedIcon />}
          onClick={onNext}
          sx={{
            px: 2.5,
            py: 1.1,
            borderRadius: 2,
            bgcolor: "#2563eb",
            fontWeight: 800,
            "&:hover": {
              bgcolor: "#1d4ed8",
            },
          }}
        >
          {currentPrizes.length === 0 ? "Skip Step" : "Next Step"}
        </Button>
      </div>

      <PrizeCreateModal
        open={isPrizeModalOpen}
        tracks={currentTracks}
        initialPrize={editingPrize}
        lockedTrackId={lockedTrackId}
        isTrackLocked={isTrackLocked}
        onClose={handleCloseModal}
        onSave={handleSavePrize}
      />
    </section>
  );
};