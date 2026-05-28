export const SectionCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm ${className}`}>
    {children}
  </div>
);