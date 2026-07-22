import type { ReactNode } from "react";

type AdminOperationsHeaderProps = {
  eyebrow: string;
  title: string;
  accentTitle: string;
  description: string;
  icon: ReactNode;
  actions?: ReactNode;
};

export function AdminOperationsHeader({
  eyebrow,
  title,
  accentTitle,
  description,
  icon,
  actions,
}: AdminOperationsHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 p-6 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-600/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(148,163,184,0.5) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-400">
            {eyebrow}
          </p>
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            <span className="flex shrink-0 text-blue-300">{icon}</span>
            <span>
              {title}{" "}
              <span className="bg-linear-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                {accentTitle}
              </span>
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-400 sm:text-base">
            {description}
          </p>
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>
        )}
      </div>
    </header>
  );
}
