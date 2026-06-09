import Chip from "@mui/material/Chip";

import type { AnnouncementResponse } from "@/types/announcement.types";

type AnnouncementStatusChipProps = {
  announcement: AnnouncementResponse;
};

export const AnnouncementStatusChip = ({
  announcement,
}: AnnouncementStatusChipProps) => {
  const colorMap = {
    DRAFT: "default",
    SCHEDULED: "warning",
    PUBLISHED: "success",
    CANCELLED: "error",
  } as const;

  return (
    <Chip
      size="small"
      label={announcement.status}
      color={colorMap[announcement.status]}
      sx={{ fontWeight: 800 }}
    />
  );
};