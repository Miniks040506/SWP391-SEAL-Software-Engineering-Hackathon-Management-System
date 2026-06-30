import { Chip } from "@mui/material";

export interface DisqualificationStatusBadgeProps {
  appealStatus?: "PENDING" | "UPHELD" | "OVERTURNED" | null;
}

export function DisqualificationStatusBadge({
  appealStatus,
}: DisqualificationStatusBadgeProps) {
  let label = "Disqualified";
  let color: "error" | "warning" | "success" = "error";

  if (appealStatus === "PENDING") {
    label = "Appeal pending";
    color = "warning";
  } else if (appealStatus === "UPHELD") {
    label = "Appeal upheld";
    color = "error";
  } else if (appealStatus === "OVERTURNED") {
    label = "Overturned";
    color = "success";
  }

  return <Chip label={label} color={color} size="small" variant="filled" />;
}
