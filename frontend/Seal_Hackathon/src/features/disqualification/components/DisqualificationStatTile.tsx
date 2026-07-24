import { useCountUp } from "../hooks/useCountUp";

type Tone = "slate" | "amber" | "red" | "emerald";

const toneStyles: Record<
  Tone,
  { value: string; icon: string; accent: string }
> = {
  slate: {
    value: "text-slate-900 dark:text-slate-100",
    icon: "text-slate-400 dark:text-slate-500",
    accent: "bg-slate-300 dark:bg-slate-600",
  },
  amber: {
    value: "text-amber-600 dark:text-amber-300",
    icon: "text-amber-500 dark:text-amber-400",
    accent: "bg-amber-400",
  },
  red: {
    value: "text-red-600 dark:text-red-400",
    icon: "text-red-500 dark:text-red-400",
    accent: "bg-red-500",
  },
  emerald: {
    value: "text-emerald-600 dark:text-emerald-400",
    icon: "text-emerald-500 dark:text-emerald-400",
    accent: "bg-emerald-500",
  },
};

export interface DisqualificationStatTileProps {
  label: string;
  value: number;
  tone?: Tone;
  icon: React.ReactNode;
  active?: boolean;
  delayMs?: number;
}

export function DisqualificationStatTile({
  label,
  value,
  tone = "slate",
  icon,
  active = false,
  delayMs = 0,
}: DisqualificationStatTileProps) {
  const animated = useCountUp(value);
  const styles = toneStyles[tone];

  return (
    <div
      className={[
        "dqx-rise group relative overflow-hidden rounded-xl border bg-white px-4 py-3 dark:bg-slate-900/60",
        active
          ? "border-red-200 dark:border-red-500/40"
          : "border-slate-200 dark:border-slate-800",
      ].join(" ")}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-center justify-between">
        <span
          className={[
            "text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400",
          ].join(" ")}
        >
          {label}
        </span>
        <span className={styles.icon}>{icon}</span>
      </div>
      <div
        className={[
          "mt-1 text-3xl font-bold leading-none tabular-nums",
          styles.value,
        ].join(" ")}
      >
        {Math.round(animated)}
      </div>
      {/* accent underline */}
      <span
        className={[
          "dqx-underline absolute bottom-0 left-0 h-[3px] w-full",
          styles.accent,
        ].join(" ")}
        style={{ animationDelay: `${delayMs + 120}ms` }}
      />
    </div>
  );
}
