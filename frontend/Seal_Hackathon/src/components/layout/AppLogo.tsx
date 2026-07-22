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
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#155dfc] shadow-xl shadow-[#155dfc]/20 transition-transform group-hover:rotate-3">
        <img
          src="/seal.png"
          alt="Seal Logo"
          className="h-8 w-8 object-contain brightness-0 invert drop-shadow-[0_0_1px_white]"
        />
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