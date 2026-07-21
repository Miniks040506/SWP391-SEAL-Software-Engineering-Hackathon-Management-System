import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";

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

const RANK_BADGES: Record<number, string> = {
  1: "bg-linear-to-br from-amber-400 to-yellow-500 text-amber-950 shadow-md shadow-amber-500/30",
  2: "bg-linear-to-br from-slate-300 to-slate-400 text-slate-800 shadow-md shadow-slate-400/30",
  3: "bg-linear-to-br from-orange-400 to-amber-600 text-orange-950 shadow-md shadow-orange-500/30",
};

function getRankBadgeClass(rankPosition: string | number | null | undefined) {
  const rank = Number(rankPosition ?? 0);
  return (
    RANK_BADGES[rank] ??
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
  );
}

type PrizeListProps = {
  items: PrizeWithIndex[];
  onEditPrize: (prizeIndex: number) => void;
  onDeletePrize: (prizeIndex: number) => void;
};

const PrizeList = ({ items, onEditPrize, onDeletePrize }: PrizeListProps) => {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-4 text-center dark:border-slate-700 dark:bg-slate-800/40">
        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
          No prizes added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {items.map(({ prize, index }) => (
        <div
          key={prize.id}
          className="group rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 transition-colors duration-200 hover:border-amber-300/70 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-amber-500/40"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black tabular-nums ${getRankBadgeClass(prize.rankPosition)}`}
              >
                #{prize.rankPosition}
              </span>

              <div className="min-w-0">
                <p className="truncate font-extrabold text-slate-900 dark:text-white">
                  {prize.title}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-black tabular-nums text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    {formatPrizeValue(prize)}
                  </span>

                  {prize.sponsorName && (
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                      Sponsor: {prize.sponsorName}
                    </span>
                  )}
                </div>

                {prize.description && (
                  <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    {prize.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onEditPrize(index)}
                aria-label={`Edit prize ${prize.title}`}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
              >
                <EditOutlinedIcon sx={{ fontSize: 17 }} />
              </button>

              <button
                type="button"
                onClick={() => onDeletePrize(index)}
                aria-label={`Delete prize ${prize.title}`}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 dark:hover:bg-rose-500/10"
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 17 }} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

type PrizeScopeSectionProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  count: number;
  onAdd: () => void;
  children: React.ReactNode;
};

const PrizeScopeSection = ({
  icon,
  title,
  subtitle,
  count,
  onAdd,
  children,
}: PrizeScopeSectionProps) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/40">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-400 text-white shadow-md shadow-amber-500/25">
          {icon}
        </span>

        <div className="min-w-0">
          <p className="truncate font-black text-slate-900 dark:text-white">
            {title}
          </p>
          <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-black tabular-nums text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
          <EmojiEventsOutlinedIcon sx={{ fontSize: 14 }} />
          {count} prize{count === 1 ? "" : "s"}
        </span>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-300/70 bg-white px-3 py-1.5 text-xs font-black text-amber-600 transition-colors duration-200 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 dark:border-amber-500/30 dark:bg-slate-900 dark:text-amber-400 dark:hover:bg-amber-500/10"
        >
          <AddOutlinedIcon sx={{ fontSize: 15 }} />
          Add Prize
        </button>
      </div>
    </div>

    <div className="p-5">{children}</div>
  </div>
);

export const PrizeTable = ({
  prizes,
  tracks,
  onAddTrackPrize,
  onEditPrize,
  onDeletePrize,
}: PrizeTableProps) => {
  const eventPrizes = getEventPrizes(prizes);

  return (
    <div className="space-y-4">
      {eventPrizes.length !== 0 && (
        <PrizeScopeSection
          icon={<PublicOutlinedIcon sx={{ fontSize: 18 }} />}
          title="Whole Event"
          subtitle="Event-level prizes."
          count={eventPrizes.length}
          onAdd={() => onAddTrackPrize("")}
        >
          <PrizeList
            items={eventPrizes}
            onEditPrize={onEditPrize}
            onDeletePrize={onDeletePrize}
          />
        </PrizeScopeSection>
      )}

      {tracks.map((track) => {
        const trackPrizes = getPrizesByTrackId(prizes, track.id);

        return (
          <PrizeScopeSection
            key={track.id}
            icon={<RouteOutlinedIcon sx={{ fontSize: 18 }} />}
            title={track.trackName || "Unnamed track"}
            subtitle={
              track.description
                ? track.description
                : `Max teams: ${track.maxTeams || "No limit"}`
            }
            count={trackPrizes.length}
            onAdd={() => onAddTrackPrize(track.id)}
          >
            <PrizeList
              items={trackPrizes}
              onEditPrize={onEditPrize}
              onDeletePrize={onDeletePrize}
            />
          </PrizeScopeSection>
        );
      })}

      {tracks.length === 0 && eventPrizes.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 px-8 py-14 text-center dark:border-slate-700">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
            <EmojiEventsOutlinedIcon sx={{ fontSize: 28 }} />
          </span>

          <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
            No prizes yet
          </h3>

          <p className="mx-auto mt-1.5 max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">
            No tracks created. You can only create event-level prizes from the
            top Add Prize button.
          </p>
        </div>
      )}
    </div>
  );
};
