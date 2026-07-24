import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";

import type { RankingResponse } from "@/types/ranking.types";

interface CoordinatorResultsPodiumProps {
  rankings: RankingResponse[];
  /** When false the three slots render empty, revealing scores only after calculation. */
  revealed: boolean;
}

const TROPHY_CORNER_GAP = 10;

function isDisqualified(row: RankingResponse) {
  return (
    row.advanceReason === "DISQUALIFIED" ||
    row.submissionStatus === "DISQUALIFIED"
  );
}

function TrophyWatermark({
  size,
  tone,
}: {
  size: number;
  tone: string;
}) {
  const glyphPadding = size / 8;
  const offset = TROPHY_CORNER_GAP - glyphPadding;

  return (
    <EmojiEventsRoundedIcon
      aria-hidden
      className={`pointer-events-none absolute select-none ${tone}`}
      style={{ fontSize: size, right: offset, bottom: offset }}
    />
  );
}

type FrameConfig = {
  rank: number;
  label: string;
  span: string;
  border: string;
  surface: string;
  medal: string;
  labelColor: string;
  nameSize: string;
  scoreSize: string;
  scoreColor: string;
  trophySize: number;
  trophyTone: string;
  showProject?: boolean;
};

const FRAME_CONFIG: FrameConfig[] = [
  {
    rank: 1,
    label: "Champion",
    span: "md:col-span-5",
    border: "border-t-2 border-amber-500 dark:border-amber-400",
    surface: "bg-amber-50/70 dark:bg-amber-400/8",
    medal:
      "h-8 w-8 bg-linear-to-br from-amber-300 to-amber-500 text-amber-950 shadow-sm shadow-amber-500/40",
    labelColor: "text-amber-600 dark:text-amber-400",
    nameSize: "text-3xl md:text-4xl",
    scoreSize: "text-6xl md:text-7xl",
    scoreColor: "text-amber-500 dark:text-amber-400",
    trophySize: 148,
    trophyTone: "text-amber-500/22 dark:text-amber-400/16",
    showProject: true,
  },
  {
    rank: 2,
    label: "2nd place",
    span: "md:col-span-4",
    border: "border-t-2 border-slate-400 dark:border-slate-500",
    surface: "bg-slate-100/70 dark:bg-slate-400/8",
    medal:
      "h-7 w-7 bg-linear-to-br from-slate-200 to-slate-400 text-slate-800 shadow-sm shadow-slate-400/40",
    labelColor: "text-slate-500 dark:text-slate-400",
    nameSize: "text-2xl",
    scoreSize: "text-5xl",
    scoreColor: "text-slate-500 dark:text-slate-300",
    trophySize: 120,
    trophyTone: "text-slate-400/30 dark:text-slate-400/18",
  },
  {
    rank: 3,
    label: "3rd place",
    span: "md:col-span-3",
    border: "border-t border-orange-600/60 dark:border-orange-500/50",
    surface: "bg-orange-50/70 dark:bg-orange-500/8",
    medal:
      "h-6 w-6 bg-linear-to-br from-orange-500 to-orange-700 text-orange-50 shadow-sm shadow-orange-700/40",
    labelColor: "text-orange-700 dark:text-orange-500",
    nameSize: "text-lg",
    scoreSize: "text-3xl",
    scoreColor: "text-orange-700 dark:text-orange-500",
    trophySize: 96,
    trophyTone: "text-orange-600/25 dark:text-orange-500/18",
  },
];

export const CoordinatorResultsPodium = ({
  rankings,
  revealed,
}: CoordinatorResultsPodiumProps) => {
  const bestByTeam = new Map<string, RankingResponse>();
  for (const row of rankings) {
    if (isDisqualified(row)) continue;
    const current = bestByTeam.get(row.teamId);
    if (!current || Number(row.totalScore) > Number(current.totalScore)) {
      bestByTeam.set(row.teamId, row);
    }
  }

  const top3 = [...bestByTeam.values()]
    .sort((a, b) => Number(b.totalScore) - Number(a.totalScore))
    .slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-12 md:items-end">
        {FRAME_CONFIG.map((cfg, index) => {
          const row = revealed ? top3[index] : undefined;
          const filled = Boolean(row);

          return (
            <div
              key={cfg.rank}
              className={`relative overflow-hidden rounded-b-2xl px-5 pt-5 pb-6 ${cfg.span} ${cfg.border} ${cfg.surface} ${filled ? "" : "opacity-90"}`}
            >
              <TrophyWatermark size={cfg.trophySize} tone={cfg.trophyTone} />
              <div className="relative space-y-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex items-center justify-center rounded-lg text-sm font-extrabold ${cfg.medal}`}
                  >
                    {cfg.rank}
                  </span>
                  <p className={`text-sm font-bold ${cfg.labelColor}`}>
                    {cfg.label}
                  </p>
                </div>

                {filled ? (
                  <>
                    <p
                      className={`font-extrabold tracking-tight text-gray-900 dark:text-white ${cfg.nameSize}`}
                    >
                      {row!.teamName}
                    </p>
                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                      {row!.trackName || "General"}
                      {cfg.showProject && row!.projectTitle
                        ? ` · ${row!.projectTitle}`
                        : ""}
                    </p>
                    <p
                      className={`font-extrabold tracking-tight tabular-nums ${cfg.scoreSize} ${cfg.scoreColor}`}
                    >
                      {Number(row!.totalScore).toFixed(2)}
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className={`font-extrabold tracking-tight text-gray-300 dark:text-slate-700 ${cfg.nameSize}`}
                    >
                      —
                    </p>
                    <p className="text-sm font-medium text-gray-400 dark:text-slate-500">
                      Awaiting calculation
                    </p>
                    <p
                      className={`font-extrabold tracking-tight tabular-nums text-gray-200 dark:text-slate-800 ${cfg.scoreSize}`}
                    >
                      —
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!revealed && (
        <p className="text-xs font-medium text-gray-400 dark:text-slate-500">
          Top-3 standings stay hidden until you run{" "}
          <span className="font-bold text-gray-500 dark:text-slate-300">
            Calculate Ranking
          </span>{" "}
          (calculates across all tracks).
        </p>
      )}
    </div>
  );
};
