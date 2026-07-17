export const timelineStyles = {
  section:
    "rounded-2xl border border-gray-200 bg-white p-8 md:p-10 dark:border-slate-800 dark:bg-slate-900",
  heading:
    "mb-10 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-slate-200",
  timelineWrapper: "relative ml-4",

  stepList: "space-y-0",
  stepRow: "relative h-20 pl-8",

  trackContainer:
    "absolute left-[5px] top-[10px] z-0 h-20 w-px bg-gray-200 dark:bg-slate-700",
  trackBlueInner: "h-full w-full bg-blue-500 transition-all duration-300",

  dot: (active: boolean, isCurrent: boolean): string =>
    [
      "absolute left-[-1px] top-[4px] z-10 h-3 w-3 rounded-full border-2 border-white shadow transition-colors dark:border-slate-900",
      active
        ? isCurrent
          ? "bg-blue-500 ring-2 ring-blue-200 ring-offset-1 dark:ring-blue-500/40 dark:ring-offset-slate-900"
          : "bg-blue-400"
        : "bg-gray-200 dark:bg-slate-600",
    ].join(" "),

  contentRow:
    "relative z-10 flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-start",

  phaseLabel: (active: boolean): string =>
    `text-xs font-bold uppercase tracking-widest ${
      active ? "text-blue-500" : "text-gray-400 dark:text-slate-500"
    }`,

  inProgressBadge:
    "ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold tracking-normal text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",

  stepTitle: (active: boolean): string =>
    `mt-0.5 text-base font-bold ${
      active
        ? "text-gray-800 dark:text-slate-100"
        : "text-gray-400 dark:text-slate-500"
    }`,

  durationBadge:
    "inline-flex h-fit w-fit items-center rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
} as const;
