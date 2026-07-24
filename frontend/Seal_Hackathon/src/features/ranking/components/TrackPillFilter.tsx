interface TrackPillFilterProps {
  tracks: { id: string; name: string }[];
  selectedTrackId: string;
  onSelect: (id: string) => void;
}

export const TrackPillFilter = ({
  tracks,
  selectedTrackId,
  onSelect,
}: TrackPillFilterProps) => {
  const options = [{ id: "all", name: "All tracks" }, ...tracks];

  return (
    <div
      role="group"
      aria-label="Filter by track"
      className="flex flex-wrap gap-2"
    >
      {options.map((track) => (
        <button
          key={track.id}
          type="button"
          aria-pressed={track.id === selectedTrackId}
          onClick={() => onSelect(track.id)}
          className="track-pill min-h-11 cursor-pointer rounded-full border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800 aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200 dark:aria-pressed:border-white dark:aria-pressed:bg-white dark:aria-pressed:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {track.name}
        </button>
      ))}
    </div>
  );
};
