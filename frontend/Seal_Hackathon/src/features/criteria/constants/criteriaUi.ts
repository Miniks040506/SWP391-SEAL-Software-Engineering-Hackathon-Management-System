export const SCORING_CRITERIA_PAGE_SIZE = 10;

export const criteriaTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
};

export const criteriaButtonSx = {
  borderRadius: "12px",
  textTransform: "none",
  fontWeight: 900,
};

/**
 * Poster-style visual theme per scoring-criteria category.
 * `gradient` drives banner / accent surfaces, `badge` styles the pill,
 * `soft` is a tinted tile background, `dot` a solid marker, `bar` the meter fill.
 */
export type CategoryThemeTokens = {
  gradient: string;
  badge: string;
  soft: string;
  ring: string;
  dot: string;
  bar: string;
  text: string;
};

export const CATEGORY_THEME: Record<string, CategoryThemeTokens> = {
  TECHNICAL: {
    gradient: "from-blue-600 via-cyan-500 to-sky-500",
    badge:
      "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30",
    soft: "bg-blue-50 dark:bg-blue-500/10",
    ring: "ring-blue-200 dark:ring-blue-500/30",
    dot: "bg-blue-500",
    bar: "bg-linear-to-r from-blue-500 to-cyan-400",
    text: "text-blue-600 dark:text-blue-400",
  },
  PRESENTATION: {
    gradient: "from-violet-600 via-purple-500 to-fuchsia-500",
    badge:
      "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30",
    soft: "bg-violet-50 dark:bg-violet-500/10",
    ring: "ring-violet-200 dark:ring-violet-500/30",
    dot: "bg-violet-500",
    bar: "bg-linear-to-r from-violet-500 to-fuchsia-400",
    text: "text-violet-600 dark:text-violet-400",
  },
  INNOVATION: {
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    badge:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
    soft: "bg-amber-50 dark:bg-amber-500/10",
    ring: "ring-amber-200 dark:ring-amber-500/30",
    dot: "bg-amber-500",
    bar: "bg-linear-to-r from-amber-500 to-orange-400",
    text: "text-amber-600 dark:text-amber-400",
  },
  BUSINESS: {
    gradient: "from-emerald-600 via-teal-500 to-cyan-500",
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
    soft: "bg-emerald-50 dark:bg-emerald-500/10",
    ring: "ring-emerald-200 dark:ring-emerald-500/30",
    dot: "bg-emerald-500",
    bar: "bg-linear-to-r from-emerald-500 to-teal-400",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  PROCESS: {
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    badge:
      "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30",
    soft: "bg-rose-50 dark:bg-rose-500/10",
    ring: "ring-rose-200 dark:ring-rose-500/30",
    dot: "bg-rose-500",
    bar: "bg-linear-to-r from-rose-500 to-pink-400",
    text: "text-rose-600 dark:text-rose-400",
  },
};

export const DEFAULT_CATEGORY_THEME: CategoryThemeTokens = {
  gradient: "from-slate-600 via-slate-500 to-slate-600",
  badge:
    "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600",
  soft: "bg-slate-100 dark:bg-slate-800",
  ring: "ring-slate-200 dark:ring-slate-700",
  dot: "bg-slate-500",
  bar: "bg-linear-to-r from-slate-500 to-slate-400",
  text: "text-slate-600 dark:text-slate-400",
};

export function getCategoryTheme(category?: string | null): CategoryThemeTokens {
  if (!category) return DEFAULT_CATEGORY_THEME;
  return CATEGORY_THEME[category] ?? DEFAULT_CATEGORY_THEME;
}
