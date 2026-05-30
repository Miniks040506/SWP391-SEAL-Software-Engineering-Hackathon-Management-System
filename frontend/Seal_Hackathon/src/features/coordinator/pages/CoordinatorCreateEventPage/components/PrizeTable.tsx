import Chip from "@mui/material/Chip";
import { IconButton } from "@mui/material";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import type {
  PrizeFormValues,
  TrackFormValues,
} from "../../../schemas/createEvent.schema";

type PrizeTableProps = {
  prizes: PrizeFormValues[];
  tracks: TrackFormValues[];
  onEditPrize: (prizeIndex: number) => void;
  onDeletePrize: (prizeIndex: number) => void;
};

function getPrizeTargetLabel(
  prize: PrizeFormValues,
  tracks: TrackFormValues[],
) {
  if (prize.targetTrackId === "Event") {
    return "Whole Event";
  }

  const track = tracks.find((item) => item.id === prize.targetTrackId);

 if (!track) {
    return "Unknown Track";
  }

  if (!prize.targetRoundId) {
    return track.trackName;
  }

  const round = track.rounds.find((item) => item.id === prize.targetRoundId);

  if (!round) {
    return `${track.trackName} · Unknown Round`;
  }

  return `${track.trackName} · ${round.roundName}`;
}

function getPrizeScopeLabel(prize: PrizeFormValues) {
  if (!prize.targetTrackId) return "Event";
  if (!prize.targetRoundId) return "Track";
  return "Round";
}

export const PrizeTable = ({
  prizes,
  tracks,
  onEditPrize,
  onDeletePrize,
}: PrizeTableProps) => {
  if (prizes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 px-6 py-12 text-center">
        <p className="text-sm font-semibold text-gray-500">
          No prizes added yet.
        </p>

        <p className="mt-1 text-sm text-gray-400">
          Click Add Prize to configure awards, or skip this step.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="grid grid-cols-[1.1fr_1.4fr_1.4fr_120px] bg-blue-500 px-6 py-4 text-sm font-extrabold uppercase tracking-wide text-white">
        <div>Rank</div>
        <div>Prize</div>
        <div>Applies To</div>
        <div className="text-right">Action</div>
      </div>

      {prizes.map((prize, index) => (
        <div
          key={prize.id}
          className="grid grid-cols-[1.1fr_1.4fr_1.4fr_120px] items-start border-t border-gray-100 px-6 py-5"
        >
          <div>
            <Chip
              label={prize.rank}
              color="primary"
              size="small"
              sx={{ fontWeight: 800 }}
            />
          </div>

          <div>
            <p className="font-extrabold text-gray-900">{prize.title}</p>

            <p className="mt-1 text-sm text-gray-500">
              {prize.value || "No value"}
            </p>

            {prize.description && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                {prize.description}
              </p>
            )}
          </div>

          <div>
            <p className="font-bold text-gray-900">
              {getPrizeTargetLabel(prize, tracks)}
            </p>

            <p className="mt-1 text-xs font-semibold text-gray-400">
              Scope: {getPrizeScopeLabel(prize)}
            </p>
          </div>

          <div className="flex justify-end gap-1">
            <IconButton color="primary" onClick={() => onEditPrize(index)}>
              <EditOutlinedIcon />
            </IconButton>

            <IconButton color="error" onClick={() => onDeletePrize(index)}>
              <DeleteOutlineOutlinedIcon />
            </IconButton>
          </div>
        </div>
      ))}
    </div>
  );
};
