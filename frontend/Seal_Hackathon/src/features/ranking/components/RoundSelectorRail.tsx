import type { RoundResponse } from "@/types/round.types";

interface RoundSelectorRailProps {
  rounds: RoundResponse[];
  selectedRoundId: string;
  onSelect: (id: string) => void;
  includeAllSegment?: boolean;
}

type StatusTone = {
  label: string;
  className: string;
};

function getStatusTone(round: RoundResponse): StatusTone {
  if (round.resultPublishedAt) {
    return {
      label: "Published",
      className:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    };
  }

  switch (round.status) {
    case "OPEN":
      return {
        label: "Open",
        className:
          "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
      };
    case "PENDING_LOCK":
      return {
        label: "Pending lock",
        className:
          "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      };
    case "CLOSED":
      return {
        label: "Locked",
        className:
          "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
      };
    case "JUDGING":
      return {
        label: "Judging",
        className:
          "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
      };
    case "RESULTS_READY":
      return {
        label: "Results ready",
        className:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      };
    case "UPCOMING":
    default:
      return {
        label: "Upcoming",
        className:
          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      };
  }
}

export const RoundSelectorRail = ({
  rounds,
  selectedRoundId,
  onSelect,
  includeAllSegment = true,
}: RoundSelectorRailProps) => {
  const sortedRounds = [...rounds].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );
  const segments = [
    ...(includeAllSegment
      ? [
          {
            id: "all",
            badge: "All",
            name: "All rounds",
            status: null,
          },
        ]
      : []),
    ...sortedRounds.map((round) => ({
      id: round.id,
      badge: round.isFinal ? "Final" : `R${round.orderIndex}`,
      name: round.name,
      status: getStatusTone(round),
    })),
  ];

  return (
    <div
      role="group"
      aria-label="Select round"
      className="flex flex-wrap gap-2"
    >
      {segments.map((segment) => {
        const active = segment.id === selectedRoundId;

        return (
          <button
            key={segment.id}
            type="button"
            aria-pressed={active}
            aria-current={active ? "true" : undefined}
            onClick={() => onSelect(segment.id)}
            className="round-seg relative flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-left transition-colors hover:border-slate-300 aria-pressed:border-blue-500 aria-pressed:bg-blue-50/60 dark:border-slate-800 dark:hover:border-slate-700 dark:aria-pressed:border-blue-500 dark:aria-pressed:bg-blue-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span className="grid h-6 min-w-6 place-items-center rounded-md bg-slate-100 px-1 text-[11px] font-extrabold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {segment.badge}
            </span>
            <span className="flex flex-col items-start gap-0.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {segment.name}
              </span>
              {segment.status && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${segment.status.className}`}
                >
                  {segment.status.label}
                </span>
              )}
            </span>
            <span
              aria-hidden
              className="round-seg__indicator absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-blue-600 dark:bg-blue-500"
            />
          </button>
        );
      })}
    </div>
  );
};
