type MiniProgressCardProps = {
  label: string;
  current: number;
  total: number;
  hint?: string;
};

export function MiniProgressCard({
  label,
  current,
  total,
  hint,
}: MiniProgressCardProps) {
  const percent = total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/30">
      <div className="flex items-center justify-between">
        <p className="text-sm font-black text-slate-800 dark:text-slate-200">{label}</p>
        <span className="text-xs font-black text-blue-500">{current}/{total}</span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${percent}%` }} />
      </div>

      {hint && <p className="mt-2 text-xs font-medium text-slate-500">{hint}</p>}
    </div>
  );
}
