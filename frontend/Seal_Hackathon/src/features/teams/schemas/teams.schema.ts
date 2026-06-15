export const filterTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    transition: "all 0.2s ease",
  },
  "& .MuiInputBase-input": { color: "#0f172a" },
  "& .MuiInputLabel-root": { color: "#64748b" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
  "&:hover .MuiOutlinedInput-root:not(.Mui-disabled)": {
    backgroundColor: "#f1f5f9",
  },
  "&:hover .MuiOutlinedInput-root:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline":
    { borderColor: "#cbd5e1" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" },
  "& .MuiOutlinedInput-root.Mui-focused": {
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.05)",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#3b82f6",
    borderWidth: "1px",
  },
  "& .MuiInputBase-root.Mui-disabled": {
    backgroundColor: "#f8fafc",
  },
  "& .MuiInputBase-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  "& .MuiInputLabel-root.Mui-disabled": {
    color: "#94a3b8",
  },
  "& .MuiInputBase-input.Mui-disabled": {
    color: "#94a3b8",
    WebkitTextFillColor: "#94a3b8",
  },
  ".dark & .MuiOutlinedInput-root": { backgroundColor: "#1e293b" },
  ".dark & .MuiInputBase-input": { color: "#f8fafc" },
  ".dark & .MuiInputLabel-root": { color: "#94a3b8" },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
  ".dark &:hover .MuiOutlinedInput-root:not(.Mui-disabled)": {
    backgroundColor: "#0f172a",
  },
  ".dark &:hover .MuiOutlinedInput-root:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline":
    { borderColor: "#475569" },
  ".dark & .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },
  ".dark & .MuiOutlinedInput-root.Mui-focused": { backgroundColor: "#0f172a" },
  ".dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
    {
      borderColor: "#3b82f6",
      borderWidth: "1px",
    },
  ".dark & .MuiInputBase-root.Mui-disabled": {
    backgroundColor: "#1e293b",
  },
  ".dark & .MuiInputBase-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: "#475569",
    borderStyle: "dashed",
  },
  ".dark & .MuiInputLabel-root.Mui-disabled": {
    color: "#64748b",
  },
  ".dark & .MuiInputBase-input.Mui-disabled": {
    color: "#64748b",
    WebkitTextFillColor: "#64748b",
  },
};

export const filterSelectSx = {
  borderRadius: "12px",
  backgroundColor: "#f8fafc",
  color: "#0f172a",
  transition: "all 0.2s ease",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
  "&:hover:not(.Mui-disabled)": { backgroundColor: "#f1f5f9" },
  "&:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline": {
    borderColor: "#cbd5e1",
  },
  "&.Mui-focused": {
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.05)",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#3b82f6",
    borderWidth: "1px",
  },
  "&.Mui-disabled": {
    backgroundColor: "#f8fafc",
  },
  "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  "&.Mui-disabled .MuiSelect-select": {
    color: "#94a3b8",
    WebkitTextFillColor: "#94a3b8",
  },
  "&.Mui-disabled .MuiSvgIcon-root": {
    color: "#cbd5e1",
  },
  ".dark &": {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
  },
  ".dark & .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
  ".dark &:hover:not(.Mui-disabled)": { backgroundColor: "#0f172a" },
  ".dark &:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline": {
    borderColor: "#475569",
  },
  ".dark &.Mui-focused": { backgroundColor: "#0f172a" },
  ".dark &.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#3b82f6",
  },
  ".dark & .MuiSvgIcon-root": { color: "#cbd5e1" },
  ".dark &.Mui-disabled": {
    backgroundColor: "#1e293b",
  },
  ".dark &.Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: "#475569",
    borderStyle: "dashed",
  },
  ".dark &.Mui-disabled .MuiSelect-select": {
    color: "#64748b",
    WebkitTextFillColor: "#64748b",
  },
  ".dark &.Mui-disabled .MuiSvgIcon-root": {
    color: "#475569",
  },
};

export const menuPropsAll = {
  sx: {
    "& .MuiPaper-root": {
      bgcolor: "#ffffff",
      color: "#0f172a",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      marginTop: "8px",
    },
    ".dark & .MuiPaper-root": {
      bgcolor: "#1e293b",
      color: "#f8fafc",
      border: "1px solid #334155",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
    },
  },
};

export const paginationSx = {
  "& .MuiPaginationItem-root": {
    color: "#475569",
    borderColor: "#e2e8f0",
    fontWeight: 600,
    borderRadius: "10px",
    minWidth: "36px",
    height: "36px",
    margin: "0 4px",
    transition: "all 0.2s ease",
  },
  "& .MuiPaginationItem-root:hover": {
    backgroundColor: "#f1f5f9",
    borderColor: "#cbd5e1",
    color: "#0f172a",
  },
  "& .MuiPaginationItem-root.Mui-selected": {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
    color: "#ffffff",
    boxShadow: "0 4px 10px -2px rgba(59, 130, 246, 0.5)",
    "&:hover": { backgroundColor: "#2563eb" },
  },
  "& .MuiPaginationItem-ellipsis": { color: "#94a3b8" },
  ".dark & .MuiPaginationItem-root": {
    color: "#cbd5e1",
    borderColor: "#334155",
  },
  ".dark & .MuiPaginationItem-root:hover": {
    backgroundColor: "#0f172a",
    borderColor: "#475569",
    color: "#f8fafc",
  },
  ".dark & .MuiPaginationItem-ellipsis": { color: "#64748b" },
};

export const getTeamStatusColor = (status: string) => {
  const s = status.toUpperCase();
  if (s === "REGISTERED" || s === "COMPETING" || s === "ADVANCED" || s === "WINNER")
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
  if (s === "ELIMINATED" || s === "DISQUALIFIED")
    return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
  if (s === "FORMING" || s === "INCOMPLETE" || s === "PENDING")
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
  return "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20";
};

export const getSubmissionStatusColor = (status: string) => {
  const s = status.toUpperCase();
  if (s === "MISSING")
    return "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-500/20";
  if (s === "LATE")
    return "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border-orange-100 dark:border-orange-500/20";
  if (s === "SUBMITTED")
    return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20";
  return "bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20";
};
