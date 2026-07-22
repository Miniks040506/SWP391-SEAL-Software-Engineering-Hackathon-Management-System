const progressFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
  useGrouping: false,
});

export function normalizeProgressPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 100);
}

export function formatProgressPercent(value: number) {
  return progressFormatter.format(normalizeProgressPercent(value));
}
