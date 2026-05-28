import { avatarColor } from "@/utils/avatarColor";

type UserPillProps = {
  name: string;
  initials: string;
  onRemove?: () => void;
};

export const UserPill = ({ name, initials, onRemove }: UserPillProps) => (
  <span className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow">
    <span
      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${avatarColor(initials[0] ?? "X")}`}>
      {initials}
    </span>
    {name}
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors">
        ×
      </button>
    )}
  </span>
);