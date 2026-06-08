import Chip from "@mui/material/Chip";

import type { AnnouncementResponse } from "@/types/announcement.types";

type AnnouncementStatusChipProps = {
  announcement: AnnouncementResponse;
};

export const AnnouncementStatusChip = ({
  announcement,
}: AnnouncementStatusChipProps) => {
  const isPublished = Boolean(announcement.publishedAt);

  return (
    <Chip
      size="small"
      label={isPublished ? "Published" : "Draft"}
      color={isPublished ? "success" : "default"}
      sx={{ fontWeight: 800 }}
    />
  );
};