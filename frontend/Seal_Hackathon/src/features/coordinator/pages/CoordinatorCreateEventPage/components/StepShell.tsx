import type { ReactNode } from "react";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CircularProgress from "@mui/material/CircularProgress";

import { WIZARD_STEPS } from "./wizardUi";

type StepShellNext = {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  tone?: "primary" | "success";
};

type StepShellProps = {
  step: number;
  title: string;
  description: string;
  headerActions?: ReactNode;
  bodyClassName?: string;
  children: ReactNode;
  onBack?: () => void;
  next: StepShellNext;
};

const NEXT_TONES = {
  primary:
    "bg-linear-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/25 hover:from-blue-500 hover:to-indigo-500",
  success:
    "bg-linear-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500",
};

export function StepShell({
  step,
  title,
  description,
  headerActions,
  bodyClassName = "space-y-6 px-7 py-6",
  children,
  onBack,
  next,
}: StepShellProps) {
  const theme = WIZARD_STEPS[step - 1];
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
              Step {step} of {WIZARD_STEPS.length}
            </p>
            <h2 className="mt-0.5 text-xl font-black text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>

        {headerActions}
      </div>

      <div className={bodyClassName}>{children}</div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-7 py-5 dark:border-slate-800">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <ArrowBackOutlinedIcon sx={{ fontSize: 17 }} />
            Back
          </button>
        ) : (
          <span />
        )}

        <button
          type={next.type ?? "button"}
          onClick={next.onClick}
          disabled={next.disabled || next.loading}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-black text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none dark:focus-visible:ring-offset-slate-900 ${NEXT_TONES[next.tone ?? "primary"]}`}
        >
          {next.loading && (
            <CircularProgress size={15} sx={{ color: "white" }} />
          )}
          {next.label}
          {!next.loading && <ArrowForwardOutlinedIcon sx={{ fontSize: 17 }} />}
        </button>
      </div>
    </section>
  );
}
