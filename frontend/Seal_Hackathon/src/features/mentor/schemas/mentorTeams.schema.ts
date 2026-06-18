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
