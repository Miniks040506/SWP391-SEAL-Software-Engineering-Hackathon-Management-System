const AVATAR_COLORS: Record<string, string> = {
  N: 'bg-blue-100 text-blue-700',
  T: 'bg-violet-100 text-violet-700',
  L: 'bg-emerald-100 text-emerald-700',
  P: 'bg-orange-100 text-orange-700',
  H: 'bg-rose-100 text-rose-700',
  D: 'bg-amber-100 text-amber-700',
  V: 'bg-cyan-100 text-cyan-700',
  B: 'bg-pink-100 text-pink-700',
};

export const avatarColor = (initial: string) =>
  AVATAR_COLORS[initial.toUpperCase()] ?? 'bg-slate-100 text-slate-700';