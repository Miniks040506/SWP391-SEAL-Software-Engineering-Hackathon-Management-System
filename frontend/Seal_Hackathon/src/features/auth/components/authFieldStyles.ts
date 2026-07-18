export const authTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#f8fafc",
    ".dark &": {
      backgroundColor: "rgba(15,23,42,0.55)",
    },
    "& fieldset": {
      borderColor: "#e2e8f0",
    },
    "&:hover fieldset": {
      borderColor: "#cbd5e1",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#3b82f6",
      borderWidth: "2px",
    },
    ".dark & fieldset": {
      borderColor: "#334155",
    },
    ".dark &:hover fieldset": {
      borderColor: "#475569",
    },
    ".dark &.Mui-focused fieldset": {
      borderColor: "#3b82f6",
    },
  },
  "& .MuiInputLabel-root": {
    ".dark &": {
      color: "#94a3b8",
    },
    ".dark &.Mui-focused": {
      color: "#3b82f6",
    },
  },
  "& .MuiInputBase-input": {
    ".dark &": {
      color: "#f8fafc",
    },
    ".dark &::placeholder": {
      color: "#64748b",
      opacity: 1,
    },
  },
  "& .MuiIconButton-root": {
    ".dark &": {
      color: "#94a3b8",
    },
  },
  "& .MuiFormHelperText-root": {
    ".dark &": {
      color: "#94a3b8",
    },
    ".dark &.Mui-error": {
      color: "#f43f5e",
    },
  },
};
