type AppLogoProps = {
  onClick: () => void;
};

export function AppLogo({ onClick }: AppLogoProps) {
  return (
    <button
      type="button"
      className="group flex cursor-pointer items-center gap-3 transition-transform active:scale-95"
      onClick={onClick}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-2xl font-bold text-white shadow-xl shadow-blue-500/20 transition-transform group-hover:rotate-3">
        S
      </div>

      <div className="flex flex-col -space-y-1 text-left">
        <span className="text-xl font-bold italic tracking-tighter text-gray-900 dark:text-white">
          SEAL
        </span>

        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">
          Hackathon System
        </span>
      </div>
    </button>
  );
}