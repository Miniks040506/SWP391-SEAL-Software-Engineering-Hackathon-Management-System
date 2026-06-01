export const SectionCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-[#1e293b] ${className}`}>
    {children}
  </div>
);