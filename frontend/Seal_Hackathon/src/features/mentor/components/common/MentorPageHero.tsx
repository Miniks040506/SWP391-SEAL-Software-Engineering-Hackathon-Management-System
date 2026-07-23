import type { CSSProperties, ReactNode } from "react";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";

export type MentorPageHeroBackTo = {
  label: string;
  onClick: () => void;
};

type MentorPageHeroProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  chips?: ReactNode;
  actions?: ReactNode;
  backTo?: MentorPageHeroBackTo;
};

/**
 * Shared mentor hero: gradient surface + blurred orb, optional back link,
 * eyebrow, title, chips row and a right-aligned actions slot.
 */
export const MentorPageHero = ({
  eyebrow,
  title,
  subtitle,
  chips,
  actions,
  backTo,
}: MentorPageHeroProps) => {
  return (
    <header
      className="mt-fade-up relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50/70 p-6 md:p-8 dark:border-slate-700/80 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40"
      style={{ "--mt-stagger": 0 } as CSSProperties}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-indigo-500/10" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {backTo && (
            <button
              type="button"
              onClick={backTo.onClick}
              className="mb-3 inline-flex cursor-pointer items-center gap-1 rounded text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
            >
              <ArrowBackOutlinedIcon sx={{ fontSize: 16 }} />
              {backTo.label}
            </button>
          )}
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
          {chips && <div className="mt-4 flex flex-wrap items-center gap-2">{chips}</div>}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-3 lg:flex-col lg:items-end">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};
