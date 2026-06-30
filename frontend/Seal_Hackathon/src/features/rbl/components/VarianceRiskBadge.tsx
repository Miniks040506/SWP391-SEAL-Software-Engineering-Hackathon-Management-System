import { Chip } from "@mui/material";

type VarianceRiskBadgeProps = {
  standardDeviation: number;
};

export function VarianceRiskBadge({ standardDeviation }: VarianceRiskBadgeProps) {
  let label = "Low";
  let color: "success" | "warning" | "error" = "success";

  if (standardDeviation >= 2.0) {
    label = "High";
    color = "error";
  } else if (standardDeviation >= 1.0) {
    label = "Medium";
    color = "warning";
  }

  return <Chip label={label} color={color} size="small" />;
}
