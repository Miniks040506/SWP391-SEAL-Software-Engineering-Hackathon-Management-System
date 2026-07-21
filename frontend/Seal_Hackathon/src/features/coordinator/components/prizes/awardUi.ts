/**
 * Shared visual tokens for the Award Management screen (medal ranks, currency).
 */
export type MedalTokens = {
  gradient: string; // podium / badge fill
  ring: string;
  text: string;
  soft: string;
  glow: string;
  label: string;
  ordinal: string;
};

const MEDALS: Record<number, MedalTokens> = {
  1: {
    gradient: "from-amber-300 via-yellow-400 to-amber-500",
    ring: "ring-amber-300 dark:ring-amber-500/40",
    text: "text-amber-600 dark:text-amber-300",
    soft: "bg-amber-50 dark:bg-amber-500/10",
    glow: "bg-amber-400/30",
    label: "Gold",
    ordinal: "1st",
  },
  2: {
    gradient: "from-slate-200 via-slate-300 to-slate-400",
    ring: "ring-slate-300 dark:ring-slate-500/40",
    text: "text-slate-500 dark:text-slate-300",
    soft: "bg-slate-100 dark:bg-slate-700/40",
    glow: "bg-slate-300/30",
    label: "Silver",
    ordinal: "2nd",
  },
  3: {
    gradient: "from-orange-400 via-amber-600 to-orange-800",
    ring: "ring-orange-300 dark:ring-orange-500/40",
    text: "text-orange-700 dark:text-orange-300",
    soft: "bg-orange-50 dark:bg-orange-500/10",
    glow: "bg-orange-500/30",
    label: "Bronze",
    ordinal: "3rd",
  },
};

const DEFAULT_MEDAL: MedalTokens = {
  gradient: "from-slate-400 via-slate-500 to-slate-600",
  ring: "ring-slate-300 dark:ring-slate-600",
  text: "text-slate-500 dark:text-slate-400",
  soft: "bg-slate-100 dark:bg-slate-800",
  glow: "bg-slate-400/20",
  label: "Rank",
  ordinal: "",
};

export function getMedal(rank?: number | null): MedalTokens {
  if (!rank) return DEFAULT_MEDAL;
  return MEDALS[rank] ?? DEFAULT_MEDAL;
}

export function formatOrdinal(rank?: number | null): string {
  if (!rank) return "—";
  const medal = MEDALS[rank];
  if (medal) return medal.ordinal;
  const mod100 = rank % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${rank}th`;
  switch (rank % 10) {
    case 1:
      return `${rank}st`;
    case 2:
      return `${rank}nd`;
    case 3:
      return `${rank}rd`;
    default:
      return `${rank}th`;
  }
}

export function formatPrizeValue(value?: number | null, currency?: string | null): string | null {
  if (value === undefined || value === null || value <= 0) return null;
  return `${value.toLocaleString()}${currency ? ` ${currency}` : ""}`;
}
