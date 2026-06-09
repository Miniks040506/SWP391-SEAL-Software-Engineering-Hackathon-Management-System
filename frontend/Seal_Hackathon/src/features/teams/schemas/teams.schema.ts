export const TEAM_STATUSES = ["ACTIVE", "INACTIVE", "PENDING", "DISQUALIFIED"];

export const filterTextFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: "10px" },
  "& .MuiInputBase-input": { color: "#1e293b" },
  "& .MuiInputLabel-root": { color: "#94a3b8" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.23)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.87)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#2563eb",
  },
  ".dark & .MuiInputBase-input": { color: "#cbd5e1" },
  ".dark & .MuiInputLabel-root": { color: "#64748b" },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
  ".dark &:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
  ".dark & .MuiInputLabel-root.Mui-focused": { color: "#93c5fd" },
  ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#3b82f6",
  },
};

export const filterSelectSx = {
  borderRadius: "10px",
  color: "#1e293b",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.23)" },
  "&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(0,0,0,0.87)",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2563eb" },
  ".dark &": { color: "#cbd5e1" },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
  ".dark &:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline": {
    borderColor: "#475569",
  },
  ".dark &.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
  ".dark & .MuiSvgIcon-root": { color: "#cbd5e1" },
};

export const menuPropsAll = {
  sx: {
    "& .MuiPaper-root": {
      bgcolor: "#ffffff",
      color: "#0f172a",
      border: "1px solid #e2e8f0",
    },
    ".dark & .MuiPaper-root": {
      bgcolor: "#1e293b",
      color: "#f1f5f9",
      border: "1px solid #334155",
    },
  },
};

export const paginationSx = {
  "& .MuiPaginationItem-root": {
    color: "#334155",
    borderColor: "#e2e8f0",
    fontWeight: 600,
    borderRadius: "8px",
    minWidth: "32px",
    height: "32px",
    margin: "0 2px",
  },
  "& .MuiPaginationItem-root:hover": {
    backgroundColor: "#f8fafc",
    borderColor: "#3b82f6",
    color: "#2563eb",
  },
  "& .MuiPaginationItem-root.Mui-selected": {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
    color: "#ffffff",
    "&:hover": { backgroundColor: "#2563eb" },
  },
  "& .MuiPaginationItem-ellipsis": { color: "#94a3b8" },
  ".dark & .MuiPaginationItem-root": {
    color: "#cbd5e1",
    borderColor: "#334155",
  },
  ".dark & .MuiPaginationItem-root:hover": {
    backgroundColor: "#1e293b",
    borderColor: "#3b82f6",
    color: "#60a5fa",
  },
  ".dark & .MuiPaginationItem-ellipsis": { color: "#64748b" },
};

export const getTeamStatusColor = (status: string) => {
  const s = status.toUpperCase();
  if (s === "ACTIVE") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
  if (s === "DISQUALIFIED") return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
  if (s === "PENDING") return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
  return "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20";
};