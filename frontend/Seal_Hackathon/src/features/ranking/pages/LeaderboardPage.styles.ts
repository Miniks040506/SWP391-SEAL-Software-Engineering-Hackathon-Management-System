export const podiumStyles = {
  wrapper:
    "grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto",

  sideCard:
    "flex flex-col items-center justify-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow bg-white border border-gray-200 rounded-2xl p-8",

  firstCard:
    "md:order-2 bg-white border-4 border-blue-500 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-5 relative shadow-2xl shadow-blue-100 transform md:-translate-y-6",

  goldBadge:
    "absolute -top-4 px-4 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg",

  firstDot:
    "w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 font-bold text-3xl border-4 border-blue-100",

  secondDot:
    "w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xl border-4 border-slate-50",

  thirdDot:
    "w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 font-bold text-xl border-4 border-amber-50",
} as const;

export const filterStyles = {
  wrapper: "flex flex-col gap-3 sm:flex-row sm:items-center",
  searchWrap: "relative",
  searchIcon: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400",
  searchInput:
    "w-full sm:w-56 pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm font-semibold text-gray-700 focus:ring-1 focus:ring-blue-400 shadow-inner",
  select:
    "min-w-35 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 focus:outline-none shadow-sm",
} as const;

export const backBtnStyle =
  "flex items-center gap-2 text-gray-400 hover:text-blue-500 text-sm font-bold transition-colors uppercase tracking-widest";

export const fullResultsBtnStyle =
  "self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-500 text-gray-500 text-xs font-bold rounded-lg transition-all shadow-sm";

export const paginationSx = {
  "& .MuiPaginationItem-root": {
    fontWeight: 700,
    fontSize: "0.75rem",
    borderColor: "#e5e7eb",
    color: "#6b7280",
  },
  "& .MuiPaginationItem-root.Mui-selected": {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
    color: "#fff",
    "&:hover": { backgroundColor: "#2563eb" },
  },
} as const;