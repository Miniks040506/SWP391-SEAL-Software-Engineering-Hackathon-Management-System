import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useMemo, useState } from "react";

import { prizeApi } from "@/api/prize.api";
import { prizeCurrencyOptions } from "@/features/coordinator/schemas/createEvent.schema";
import type { UUID } from "@/types/common.types";
import type { PrizeResponse } from "@/types/prize.types";
import type { TrackResponse } from "@/types/track.types";

type PrizesTabProps = {
  eventId: UUID;
  tracks: TrackResponse[];
  prizes: PrizeResponse[];
  isLoading: boolean;
  onChanged: () => void | Promise<void>;
  canEdit: boolean;
  readonlyReason?: string;
};

type PrizeForm = {
  title: string;
  trackId: string;
  rankPosition: string;
  value: string;
  currency: string;
  sponsorName: string;
  description: string;
};

const emptyPrizeForm: PrizeForm = {
  title: "",
  trackId: "",
  rankPosition: "",
  value: "",
  currency: "VND",
  sponsorName: "",
  description: "",
};

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
};

function getId(value: unknown) {
  return (value as { id: UUID }).id;
}

function getTrackName(track: TrackResponse) {
  const raw = track as { name?: string; trackName?: string };
  return raw.name ?? raw.trackName ?? "Untitled track";
}

function getPrizeTitle(prize: PrizeResponse) {
  return (
    (prize as { title?: string; name?: string }).title ??
    (prize as { name?: string }).name ??
    "Untitled prize"
  );
}

function formatPrizeValue(prize: PrizeResponse) {
  const value = (prize as { value?: number }).value;
  const currency = (prize as { currency?: string }).currency ?? "";

  if (value == null) return "—";

  return `${Number(value).toLocaleString("vi-VN")} ${currency}`.trim();
}

function getPrizeTrackId(prize: PrizeResponse) {
  return ((prize as { trackId?: UUID | null }).trackId ?? "") as UUID | "";
}

function groupPrizesByTrack(prizes: PrizeResponse[], tracks: TrackResponse[]) {
  const eventPrizes = prizes.filter((prize) => !getPrizeTrackId(prize));
  const trackGroups = tracks.map((track) => ({
    track,
    prizes: prizes.filter((prize) => getPrizeTrackId(prize) === getId(track)),
  }));

  return { eventPrizes, trackGroups };
}

export function PrizesTab({
  eventId,
  tracks,
  prizes,
  isLoading,
  onChanged,
  canEdit,
  readonlyReason,
}: PrizesTabProps) {
  const [form, setForm] = useState<PrizeForm>(emptyPrizeForm);

  const groupedPrizes = useMemo(
    () => groupPrizesByTrack(prizes, tracks),
    [prizes, tracks],
  );

  const handleCreate = async () => {
    if (!canEdit) return;

    if (!form.title.trim()) {
      enqueueSnackbar("Prize title is required.", { variant: "error" });
      return;
    }

    if (!form.rankPosition || Number(form.rankPosition) < 1) {
      enqueueSnackbar("Rank position must be greater than 0.", {
        variant: "error",
      });
      return;
    }

    try {
      await prizeApi.createPrize({
        eventId,
        title: form.title.trim(),
        trackId: form.trackId || undefined,
        rankPosition: Number(form.rankPosition),
        value: form.value ? Number(form.value) : undefined,
        currency: form.currency,
        sponsorName: form.sponsorName.trim() || undefined,
        description: form.description.trim() || undefined,
      });

      setForm(emptyPrizeForm);
      enqueueSnackbar("Prize created.", { variant: "success" });
      await onChanged();
    } catch {
      enqueueSnackbar("Failed to create prize.", { variant: "error" });
    }
  };

  const handleDelete = async (prizeId: UUID) => {
    if (!canEdit) return;

    try {
      await prizeApi.deletePrize(prizeId);
      enqueueSnackbar("Prize deleted.", { variant: "success" });
      await onChanged();
    } catch {
      enqueueSnackbar("Failed to delete prize.", { variant: "error" });
    }
  };

  const renderPrizeList = (items: PrizeResponse[]) => {
    if (items.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-800/40">
          No prizes in this group.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((prize) => (
          <div
            key={getId(prize)}
            className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                  #{(prize as { rankPosition?: number }).rankPosition ?? "—"}
                </span>
                <p className="font-black text-slate-950 dark:text-white">
                  {getPrizeTitle(prize)}
                </p>
              </div>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                {formatPrizeValue(prize)}
              </p>

              {(prize as { sponsorName?: string }).sponsorName && (
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Sponsor: {(prize as { sponsorName?: string }).sponsorName}
                </p>
              )}

              {(prize as { description?: string }).description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                  {(prize as { description?: string }).description}
                </p>
              )}
            </div>

            {canEdit && (
              <IconButton
                color="error"
                onClick={() => handleDelete(getId(prize))}
              >
                <DeleteOutlineOutlinedIcon />
              </IconButton>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-7 py-5 dark:border-slate-700">
        <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
          Prizes
        </h2>

        <p className="mt-2 text-sm font-medium text-slate-500">
          Manage prizes for the whole event or a specific track. Saved prizes
          are grouped below.
        </p>
      </div>

      <div className="space-y-6 px-7 py-6">
        {!canEdit && readonlyReason && (
          <Alert severity="warning">{readonlyReason}</Alert>
        )}

        {canEdit && (
          <div className="rounded-2xl border border-dashed border-slate-200 p-5 dark:border-slate-700">
            <h3 className="mb-4 font-black text-slate-800 dark:text-white">
              Add Prize
            </h3>

            <div className="grid gap-4 lg:grid-cols-2">
              <TextField
                label="Prize title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                size="small"
                sx={textFieldSx}
              />

              <TextField
                label="Track"
                select
                value={form.trackId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    trackId: event.target.value,
                  }))
                }
                size="small"
                sx={textFieldSx}
              >
                <MenuItem value="">Whole event prize</MenuItem>
                {tracks.map((track) => (
                  <MenuItem key={getId(track)} value={getId(track)}>
                    {getTrackName(track)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Rank position"
                type="number"
                value={form.rankPosition}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    rankPosition: event.target.value,
                  }))
                }
                size="small"
                sx={textFieldSx}
                required
              />

              <TextField
                label="Value"
                type="number"
                value={form.value}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    value: event.target.value,
                  }))
                }
                size="small"
                sx={textFieldSx}
              />

              <TextField
                label="Currency"
                select
                value={form.currency}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    currency: event.target.value,
                  }))
                }
                size="small"
                sx={textFieldSx}
              >
                {prizeCurrencyOptions.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Sponsor"
                value={form.sponsorName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sponsorName: event.target.value,
                  }))
                }
                size="small"
                sx={textFieldSx}
              />

              <TextField
                label="Description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                multiline
                minRows={3}
                className="lg:col-span-2"
                size="small"
                sx={textFieldSx}
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="outlined"
                startIcon={<AddOutlinedIcon />}
                onClick={handleCreate}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 900,
                }}
              >
                Add Prize
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <CircularProgress />
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="bg-blue-500 px-6 py-4 text-sm font-extrabold uppercase tracking-wide text-white">
            Prize groups
          </div>

          <div className="border-t border-slate-100 px-6 py-5 dark:border-slate-700">
            <div className="mb-4 flex items-center gap-2">
              <EmojiEventsOutlinedIcon
                fontSize="small"
                className="text-blue-500"
              />
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white">
                  Whole Event
                </p>
                <p className="text-sm text-slate-500">Event-level prizes.</p>
              </div>
            </div>

            {renderPrizeList(groupedPrizes.eventPrizes)}
          </div>

          {groupedPrizes.trackGroups.map(({ track, prizes: trackPrizes }) => (
            <div
              key={getId(track)}
              className="border-t border-slate-100 px-6 py-5 dark:border-slate-700"
            >
              <div className="mb-4">
                <p className="font-extrabold text-slate-900 dark:text-white">
                  {getTrackName(track)}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {(track as { description?: string }).description ||
                    "No description"}
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-400">
                  {trackPrizes.length} prize(s)
                </p>
              </div>

              {renderPrizeList(trackPrizes)}
            </div>
          ))}

          {!isLoading && prizes.length === 0 && tracks.length === 0 && (
            <div className="border-t border-slate-100 px-6 py-8 text-center dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-500">
                No prizes yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
