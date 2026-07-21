import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import type {
  CreateEventFormValues,
  PrizeFormValues,
} from "../../schemas/createEvent.schema";

import { StepShell } from "./components/StepShell";
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

  const {
    append: appendPrize,
    update: updatePrize,
    remove: removePrize,
  } = useFieldArray({
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
    <>
      <StepShell
        step={3}
        title="Prizes"
        description="Add event-level or track-specific prizes. Track row actions will lock the prize to that track."
        headerActions={
          <button
            type="button"
            onClick={handleOpenGlobalCreateModal}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-amber-500/25 transition-all duration-200 hover:from-amber-400 hover:to-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            <AddOutlinedIcon sx={{ fontSize: 18 }} />
            Add Prize
          </button>
        }
        bodyClassName="px-7 py-6"
        onBack={onBack}
        next={{
          label: currentPrizes.length === 0 ? "Skip Step" : "Next Step",
          onClick: onNext,
        }}
      >
        <PrizeTable
          prizes={currentPrizes}
          tracks={currentTracks}
          onAddTrackPrize={handleOpenTrackPrizeModal}
          onEditPrize={handleOpenEditModal}
          onDeletePrize={removePrize}
        />
      </StepShell>

      <PrizeCreateModal
        open={isPrizeModalOpen}
        tracks={currentTracks}
        initialPrize={editingPrize}
        lockedTrackId={lockedTrackId}
        isTrackLocked={isTrackLocked}
        onClose={handleCloseModal}
        onSave={handleSavePrize}
      />
    </>
  );
};
