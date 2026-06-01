export const DialogCancelBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:bg-slate-800! dark:hover:text-slate-200!">
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
    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow disabled:opacity-50 transition-all dark:bg-blue-600! dark:text-slate-100! dark:hover:bg-blue-500!">
    {label}
  </button>
);