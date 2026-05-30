const CURRENT_YEAR = new Date().getFullYear();

const BottomBar = () => {
  return (
    <div className="flex flex-col items-center justify-between gap-6 border-t border-gray-100 pt-8 dark:border-slate-800 md:flex-row">
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500 md:justify-start">
        <span>FPT University HCM</span>
        <span>PDP Department</span>
        <span>SE Faculty</span>
      </div>

      <div className="text-xs font-semibold text-gray-400 dark:text-slate-500">
        © {CURRENT_YEAR} SEAL LEAGUE PORTAL
      </div>
    </div>
  );
};

export default BottomBar;