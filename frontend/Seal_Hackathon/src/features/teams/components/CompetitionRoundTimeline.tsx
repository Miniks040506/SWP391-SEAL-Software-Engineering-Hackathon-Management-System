import CheckIcon from "@mui/icons-material/Check";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import type { EventCompetitionRoundResponse } from "@/types/team.types";

type RoundPhase = "done" | "live" | "upcoming";

function getRoundPhase(round: EventCompetitionRoundResponse): RoundPhase {
  if (round.open) return "live";
  if (round.submissionLocked || round.status !== "UPCOMING") return "done";
  return "upcoming";
}

const shortDate = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

/** Round window as a compact range, e.g. "Jun 19 – Jun 23". */
function formatWindow(round: EventCompetitionRoundResponse) {
  if (!round.startAt && !round.endAt) return "Schedule not set";
  const start = round.startAt ? shortDate.format(new Date(round.startAt)) : "?";
  const end = round.endAt ? shortDate.format(new Date(round.endAt)) : "?";
  return `${start} – ${end}`;
}

/** Most informative one-liner available for the round's card. */
function roundSubtitle(round: EventCompetitionRoundResponse) {
  if (round.rankPosition) {
    return `Rank #${round.rankPosition}${
      round.totalScore != null ? ` · ${round.totalScore} pts` : ""
    }`;
  }
  return formatWindow(round);
}

type Props = {
  rounds: EventCompetitionRoundResponse[];
  selectedRoundId?: string | null;
  onSelect: (roundId: string) => void;
};

/**
 * Horizontal progress rail of every round in the track. Replaces the tall
 * sidebar list so the competition reads as a journey instead of a menu.
 */
export function CompetitionRoundTimeline({
  rounds,
  selectedRoundId,
  onSelect,
}: Props) {
  return (
    <section
      aria-label="Competition rounds"
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5"
    >
      <div className="flex items-center justify-between gap-3 pb-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-slate-500">
          Track progress
        </h2>
        <p className="text-xs font-medium text-gray-400 dark:text-slate-500">
          {rounds.length} {rounds.length === 1 ? "round" : "rounds"}
        </p>
      </div>

      <ol
        role="tablist"
        aria-label="Select a round"
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${rounds.length}, minmax(0, 1fr))`,
        }}
      >
        {rounds.map((round, index) => {
          const phase = getRoundPhase(round);
          const selected = round.roundId === selectedRoundId;

          return (
            <li key={round.roundId} className="min-w-0">
              <button
                type="button"
                role="tab"
                id={`round-tab-${round.roundId}`}
                aria-selected={selected}
                aria-controls={`round-panel-${round.roundId}`}
                onClick={() => onSelect(round.roundId)}
                className={[
                  "group w-full cursor-pointer rounded-xl border p-3 text-left transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900",
                  selected
                    ? "border-blue-400 bg-blue-50 dark:border-blue-500/60 dark:bg-blue-500/10"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/5",
                ].join(" ")}
              >
                {/* connector + node */}
                <div className="flex items-center gap-2 pb-2.5">
                  <span
                    className={[
                      "relative flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      phase === "live"
                        ? "bg-blue-500 text-white"
                        : phase === "done"
                          ? "bg-gray-900 text-white dark:bg-slate-200 dark:text-slate-900"
                          : "border border-dashed border-gray-300 text-gray-400 dark:border-slate-700 dark:text-slate-500",
                    ].join(" ")}
                  >
                    {phase === "live" && (
                      <span className="absolute inset-0 rounded-full bg-blue-500 opacity-60 motion-safe:animate-ping" />
                    )}
                    <span className="relative">
                      {phase === "done" ? (
                        round.submissionLocked ? (
                          <LockOutlinedIcon style={{ fontSize: 13 }} />
                        ) : (
                          <CheckIcon style={{ fontSize: 14 }} />
                        )
                      ) : (
                        index + 1
                      )}
                    </span>
                  </span>

                  <span
                    aria-hidden
                    className={[
                      "h-px flex-1 rounded-full",
                      phase === "upcoming"
                        ? "bg-gray-200 dark:bg-slate-800"
                        : "bg-gray-900/20 dark:bg-slate-500/40",
                    ].join(" ")}
                  />

                  <span
                    className={[
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      phase === "live"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                        : phase === "done"
                          ? "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300"
                          : "bg-gray-50 text-gray-400 dark:bg-slate-900 dark:text-slate-500",
                    ].join(" ")}
                  >
                    {phase === "live"
                      ? "Live"
                      : phase === "done"
                        ? "Closed"
                        : "Soon"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <p
                    className={[
                      "truncate text-sm font-semibold",
                      selected
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-900 dark:text-slate-100",
                    ].join(" ")}
                    title={round.roundName}
                  >
                    {round.roundName}
                  </p>
                  {round.isFinal && (
                    <span className="shrink-0 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:border-slate-700 dark:text-slate-400">
                      Final
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-slate-400">
                  {roundSubtitle(round)}
                </p>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
