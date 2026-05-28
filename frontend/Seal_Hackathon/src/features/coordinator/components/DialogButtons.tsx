export const DialogCancelBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
    Cancel
  </button>
);

export const DialogConfirmBtn = ({
  onClick,
  disabled,
  label = "Confirm",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow disabled:opacity-50 transition-all">
    {label}
  </button>
);