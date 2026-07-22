import type { ReactNode } from "react";

import { getEditTabTheme, type EditTab } from "./editEventUi";

type TabShellProps = {
  tab: EditTab;
  title: string;
  description: string;
  headerActions?: ReactNode;
  bodyClassName?: string;
  children: ReactNode;
};

/**
 * Section chrome for every Edit Event tab — mirrors the Create Event wizard's
 * StepShell (gradient icon badge, eyebrow, title, description, header actions)
 * without the back/next footer.
 */
export function TabShell({
  tab,
  title,
  description,
  headerActions,
  bodyClassName = "space-y-6 px-7 py-6",
  children,
}: TabShellProps) {
  const theme = getEditTabTheme(tab);
  const Icon = theme.icon;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-7 py-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="flex items-start gap-4">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${theme.gradient} text-white shadow-lg ${theme.glow}`}
          >
            <Icon />
          </span>

          <div>
            <p
              className={`text-[11px] font-black uppercase tracking-[0.18em] ${theme.text}`}
            >
              Edit Event · {theme.label}
            </p>
            <h2 className="mt-0.5 text-xl font-black text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>

        {headerActions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {headerActions}
          </div>
        )}
      </div>

      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
