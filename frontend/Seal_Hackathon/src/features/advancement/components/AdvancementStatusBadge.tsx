import { Chip } from "@mui/material";
import { CheckCircleOutlined, CancelOutlined, StarOutlined, HourglassEmptyOutlined } from "@mui/icons-material";

export type AdvancementStatus =
  | "ADVANCED"
  | "ELIMINATED"
  | "WILDCARD"
  | "PENDING_CONFIRMATION";

interface AdvancementStatusBadgeProps {
  status: AdvancementStatus;
}

export function AdvancementStatusBadge({ status }: AdvancementStatusBadgeProps) {
  let color: "success" | "error" | "warning" | "default" = "default";
  let icon = <HourglassEmptyOutlined />;
  let label = "Pending Confirmation";

  switch (status) {
    case "ADVANCED":
      color = "success";
      icon = <CheckCircleOutlined />;
      label = "Advanced";
      break;
    case "ELIMINATED":
      color = "error";
      icon = <CancelOutlined />;
      label = "Eliminated";
      break;
    case "WILDCARD":
      color = "warning";
      icon = <StarOutlined />;
      label = "Wildcard";
      break;
    case "PENDING_CONFIRMATION":
    default:
      color = "default";
      icon = <HourglassEmptyOutlined />;
      label = "Pending Confirmation";
      break;
  }

  return (
    <Chip
      label={label}
      color={color}
      icon={icon}
      size="small"
      variant="outlined"
    />
  );
}
