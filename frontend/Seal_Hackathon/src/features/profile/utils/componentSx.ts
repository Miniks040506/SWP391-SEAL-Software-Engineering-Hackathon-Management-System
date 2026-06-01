export const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    fontFamily: "inherit",
    backgroundColor: "#ffffff",
    color: "#111827",

    "& fieldset": {
      borderColor: "#d1d5db",
    },

    "&:hover fieldset": {
      borderColor: "#94a3b8",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#4f6cff",
      borderWidth: "1.5px",
    },

    "&.Mui-disabled": {
      backgroundColor: "#f8fafc",
    },
  },

  "& .MuiInputBase-input": {
    fontFamily: "inherit",
    fontSize: "0.95rem",
    fontWeight: 400,
    color: "#111827",
  },

  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "#64748b",
    color: "#64748b",
    fontWeight: 400,
  },

  "& .MuiInputLabel-root": {
    fontFamily: "inherit",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#64748b",
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "#4f6cff",
    fontWeight: 500,
  },

  "& .MuiInputLabel-root.Mui-disabled": {
    color: "#94a3b8",
  },

  "& .MuiFormHelperText-root": {
    fontFamily: "inherit",
    fontSize: "0.78rem",
    fontWeight: 400,
    color: "#64748b",
  },

  "& .MuiIconButton-root": {
    color: "#64748b",
  },

  ".dark & .MuiOutlinedInput-root": {
    backgroundColor: "rgba(15,23,42,0.45)",
    color: "#e5e7eb",

    "& fieldset": {
      borderColor: "rgba(148,163,184,0.26)",
    },

    "&:hover fieldset": {
      borderColor: "rgba(148,163,184,0.48)",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#4f6cff",
      boxShadow: "0 0 0 3px rgba(79,108,255,0.12)",
    },

    "&.Mui-disabled": {
      backgroundColor: "rgba(15,23,42,0.35)",
    },
  },

  ".dark & .MuiInputBase-input": {
    color: "#e5e7eb",
    fontWeight: 400,
  },

  ".dark & .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "#94a3b8",
    color: "#94a3b8",
    fontWeight: 400,
  },

  ".dark & .MuiInputLabel-root": {
    color: "#94a3b8",
    fontWeight: 500,
  },

  ".dark & .MuiInputLabel-root.Mui-focused": {
    color: "#93c5fd",
  },

  ".dark & .MuiInputLabel-root.Mui-disabled": {
    color: "#64748b",
  },

  ".dark & .MuiFormHelperText-root": {
    color: "#94a3b8",
    fontWeight: 400,
  },

  ".dark & .MuiIconButton-root": {
    color: "#94a3b8",
  },
};

export const tabsSx = {
  mb: 3,

  "& .MuiTab-root": {
    minHeight: 48,
    textTransform: "none",
    fontFamily: "inherit",
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#64748b",
    opacity: 1,
  },

  "& .MuiTab-root.Mui-selected": {
    color: "#4f6cff",
    fontWeight: 700,
  },

  "& .MuiTab-iconWrapper": {
    color: "inherit",
  },

  "& .MuiTabs-indicator": {
    height: 2,
    borderRadius: 999,
    backgroundColor: "#4f6cff",
  },

  ".dark & .MuiTab-root": {
    color: "#94a3b8",
    opacity: 1,
  },

  ".dark & .MuiTab-root.Mui-selected": {
    color: "#5b7cff",
  },

  ".dark & .MuiTabs-indicator": {
    backgroundColor: "#5b7cff",
  },
};

export const dividerSx = {
  mb: 3,
  borderColor: "#e5e7eb",

  ".dark &": {
    borderColor: "rgba(148,163,184,0.18)",
  },
};

export const infoAlertSx = {
  borderRadius: "12px",
  fontFamily: "inherit",
  fontWeight: 400,

  ".dark &": {
    color: "#bae6fd",
    backgroundColor: "rgba(14,165,233,0.12)",
    border: "1px solid rgba(56,189,248,0.24)",
  },

  ".dark & .MuiAlert-icon": {
    color: "#38bdf8",
  },
};