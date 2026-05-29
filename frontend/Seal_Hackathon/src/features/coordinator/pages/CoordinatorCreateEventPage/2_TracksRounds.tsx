import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import Button from "@mui/material/Button";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

import type {
  CreateEventFormValues,
  TrackFormValues,
} from "../../schemas/createEvent.schema";

import { TrackCreateModal } from "./components/TrackCreateModal";
import { TrackRoundsTable } from "./components/TrackRoundsTable";

type TracksRoundsStepProps = {
  onNext: () => void;
  onBack: () => void;
};

export const TracksRoundsStep = ({ onNext, onBack }: TracksRoundsStepProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();

  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [editingTrackIndex, setEditingTrackIndex] = useState<number | null>(
    null,
  );

  const {
    append: appendTrack,
    remove: removeTrack,
    update: updateTrack,
  } = useFieldArray({
    control,
    name: "tracks",
    keyName: "fieldId",
  });

  const tracks = useWatch({
    control,
    name: "tracks",
  });

  const currentTracks = tracks ?? [];
  const tracksRootError = errors.tracks?.root?.message;
  const editingTrack =
    editingTrackIndex !== null ? currentTracks[editingTrackIndex] : null;

  const handleOpenCreateModal = () => {
    setEditingTrackIndex(null);
    setIsTrackModalOpen(true);
  };

  const handleOpenEditModal = (trackIndex: number) => {
    setEditingTrackIndex(trackIndex);
    setIsTrackModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTrackModalOpen(false);
    setEditingTrackIndex(null);
  };

  const handleSaveTrack = (track: TrackFormValues) => {
    if (editingTrackIndex === null) {
      appendTrack(track);
      return;
    }

    updateTrack(editingTrackIndex, track);
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-7 py-5">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">
            Step 2: Tracks & Rounds
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create a track through a modal, add its rounds, then review all
            tracks below.
          </p>

          {tracksRootError && (
            <p className="mt-1 text-sm font-semibold text-red-600">
              {tracksRootError}
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={handleOpenCreateModal}
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
          Create Track
        </Button>
      </div>

      <div className="px-7 py-6">
        <TrackRoundsTable
          tracks={currentTracks}
          onEditTrack={handleOpenEditModal}
          onDeleteTrack={removeTrack}
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
          {currentTracks.length === 0 ? "Skip Step" : "Next Step"}
        </Button>
      </div>

      <TrackCreateModal
        open={isTrackModalOpen}
        initialTrack={editingTrack}
        onClose={handleCloseModal}
        onSave={handleSaveTrack}
      />
    </section>
  );
};
