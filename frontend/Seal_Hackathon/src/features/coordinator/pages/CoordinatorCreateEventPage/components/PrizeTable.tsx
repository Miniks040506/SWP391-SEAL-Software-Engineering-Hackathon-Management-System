import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import type {
  PrizeFormValues,
  TrackFormValues,
} from "../../../schemas/createEvent.schema";

type PrizeTableProps = {
  prizes: PrizeFormValues[];
  tracks: TrackFormValues[];
  onAddTrackPrize: (trackId: string) => void;
  onEditPrize: (prizeIndex: number) => void;
  onDeletePrize: (prizeIndex: number) => void;
};

type PrizeWithIndex = {
  prize: PrizeFormValues;
  index: number;
};

function formatPrizeValue(prize: PrizeFormValues) {
  const amount = Number(prize.value);

  if (Number.isNaN(amount)) return "-";

  return `${amount.toLocaleString("vi-VN")} ${prize.currency}`;
}

function getPrizesByTrackId(prizes: PrizeFormValues[], trackId: string) {
  return prizes
    .map((prize, index) => ({
      prize,
      index,
    }))
    .filter((item) => item.prize.trackId === trackId);
}

function getEventPrizes(prizes: PrizeFormValues[]) {
  return prizes
    .map((prize, index) => ({
      prize,
      index,
    }))
    .filter((item) => !item.prize.trackId);
}

type PrizeListProps = {
  items: PrizeWithIndex[];
  onEditPrize: (prizeIndex: number) => void;
  onDeletePrize: (prizeIndex: number) => void;
};

const PrizeList = ({ items, onEditPrize, onDeletePrize }: PrizeListProps) => {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-slate-50 px-4 py-3">
        <p className="text-sm font-semibold text-gray-500">
          No prizes added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map(({ prize, index }) => (
        <div
          key={prize.id}
          className="rounded-xl border border-gray-100 bg-slate-50 px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  label={`#${prize.rankPosition}`}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 800 }}
                />

                <p className="font-extrabold text-gray-900">{prize.title}</p>
              </div>

              <p className="mt-1 text-sm font-semibold text-gray-600">
                {formatPrizeValue(prize)}
              </p>

              {prize.sponsorName && (
                <p className="mt-1 text-xs font-semibold text-gray-400">
                  Sponsor: {prize.sponsorName}
                </p>
              )}

              {prize.description && (
                <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                  {prize.description}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-2">
              <IconButton
                color="primary"
                size="small"
                onClick={() => onEditPrize(index)}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>

              <IconButton
                color="error"
                size="small"
                onClick={() => onDeletePrize(index)}
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const PrizeTable = ({
  prizes,
  tracks,
  onAddTrackPrize,
  onEditPrize,
  onDeletePrize,
}: PrizeTableProps) => {
  const eventPrizes = getEventPrizes(prizes);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="grid grid-cols-[220px_180px_120px_minmax(0,1fr)] bg-blue-500 px-6 py-4 text-sm font-extrabold uppercase tracking-wide text-white">
        <div>Track</div>
        <div></div>
        <div>Total</div>
        <div>Prizes</div>
      </div>

      {eventPrizes.length !== 0 && (
        <div className="grid grid-cols-[220px_180px_120px_minmax(0,1fr)] items-start border-t border-gray-100 px-6 py-5">
          <div>
            <p className="font-extrabold text-gray-900">Whole Event</p>
            <p className="mt-1 text-sm text-gray-500">Event-level prizes.</p>
          </div>

          <div className="flex justify-start">
            <Button
              type="button"
              variant="outlined"
              size="small"
              startIcon={<AddOutlinedIcon />}
              onClick={() => onAddTrackPrize("")}
              sx={{ fontWeight: 800 }}
            >
              Add Prize
            </Button>
          </div>

          <div className="text-sm font-bold text-gray-700">
            {eventPrizes.length} prize(s)
          </div>

          <PrizeList
            items={eventPrizes}
            onEditPrize={onEditPrize}
            onDeletePrize={onDeletePrize}
          />
        </div>
      )}

      {tracks.map((track) => {
        const trackPrizes = getPrizesByTrackId(prizes, track.id);

        return (
          <div
            key={track.id}
            className="grid grid-cols-[220px_180px_120px_minmax(0,1fr)] items-start border-t border-gray-100 px-6 py-5"
          >
            <div>
              <p className="font-extrabold text-gray-900">{track.trackName}</p>

              <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                {track.description || "No description"}
              </p>

              <p className="mt-2 text-xs font-semibold text-gray-400">
                Max teams: {track.maxTeams || "No limit"}
              </p>
            </div>

            <div className="flex justify-start">
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<AddOutlinedIcon />}
                onClick={() => onAddTrackPrize(track.id)}
                sx={{ fontWeight: 800 }}
              >
                Add Prize
              </Button>
            </div>

            <div className="text-sm font-bold text-gray-700">
              {trackPrizes.length} prize(s)
            </div>

            <PrizeList
              items={trackPrizes}
              onEditPrize={onEditPrize}
              onDeletePrize={onDeletePrize}
            />
          </div>
        );
      })}

      {tracks.length === 0 && eventPrizes.length === 0 && (
        <div className="border-t border-gray-100 px-6 py-8 text-center">
          <p className="text-sm font-semibold text-gray-500">
            No tracks created. You can only create event-level prizes from the
            top Add Prize button.
          </p>
        </div>
      )}
    </div>
  );
};
