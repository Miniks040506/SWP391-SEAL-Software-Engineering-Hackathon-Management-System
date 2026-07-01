import Chip from "@mui/material/Chip";
import type { ExportJobStatus } from "@/types/export.types";

type Props = {
  status: ExportJobStatus | string;
};

export const ExportStatusBadge = ({ status }: Props) => {
  let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default";

  switch (status) {
    case "QUEUED":
      color = "default";
      break;
    case "PROCESSING":
      color = "info";
      break;
    case "DONE":
      color = "success";
      break;
    case "FAILED":
      color = "error";
      break;
  }

  return (
    <Chip
      label={status}
      size="small"
      color={color}
      sx={{ fontWeight: 800, fontSize: "10px" }}
      variant={status === "DONE" || status === "FAILED" ? "filled" : "outlined"}
    />
  );
};
