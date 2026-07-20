import { Chip } from "@mui/material";

export interface DisqualificationStatusBadgeProps {
  appealStatus?: "PENDING" | "UPHELD" | "OVERTURNED" | null;
}

const statusStyles = {
  DISQUALIFIED: {
    label: "Disqualified",
    color: "#be123c",
    backgroundColor: "rgba(255, 241, 242, 0.9)",
    borderColor: "#fecdd3",
    darkColor: "#fda4af",
    darkBackgroundColor: "rgba(136, 19, 55, 0.22)",
    darkBorderColor: "rgba(159, 18, 57, 0.7)",
  },
  PENDING: {
    label: "Appeal pending",
    color: "#a16207",
    backgroundColor: "rgba(255, 251, 235, 0.9)",
    borderColor: "#fde68a",
    darkColor: "#fcd34d",
    darkBackgroundColor: "rgba(120, 53, 15, 0.22)",
    darkBorderColor: "rgba(146, 64, 14, 0.7)",
  },
  UPHELD: {
    label: "Appeal upheld",
    color: "#be123c",
    backgroundColor: "rgba(255, 241, 242, 0.9)",
    borderColor: "#fecdd3",
    darkColor: "#fda4af",
    darkBackgroundColor: "rgba(136, 19, 55, 0.22)",
    darkBorderColor: "rgba(159, 18, 57, 0.7)",
  },
  OVERTURNED: {
    label: "Overturned",
    color: "#047857",
    backgroundColor: "rgba(236, 253, 245, 0.9)",
    borderColor: "#a7f3d0",
    darkColor: "#6ee7b7",
    darkBackgroundColor: "rgba(6, 78, 59, 0.22)",
    darkBorderColor: "rgba(4, 120, 87, 0.7)",
  },
} as const;

export function DisqualificationStatusBadge({
  appealStatus,
}: DisqualificationStatusBadgeProps) {
  const status = statusStyles[appealStatus ?? "DISQUALIFIED"];

  return (
    <Chip
      label={status.label}
      size="small"
      variant="outlined"
      sx={{
        height: 30,
        alignSelf: "flex-start",
        borderRadius: "9px",
        borderColor: status.borderColor,
        backgroundColor: status.backgroundColor,
        color: status.color,
        fontWeight: 800,
        "& .MuiChip-label": { px: 1.25 },
        ".dark &": {
          borderColor: status.darkBorderColor,
          backgroundColor: status.darkBackgroundColor,
          color: status.darkColor,
        },
      }}
    />
  );
}
