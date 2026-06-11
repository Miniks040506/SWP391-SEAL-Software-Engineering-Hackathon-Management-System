import Chip from "@mui/material/Chip";

import type {
  InvitationStatus,
  TeamMemberRole,
  TeamStatus,
} from "../schemas/team.schema";

type TeamStatusBadgeProps = {
  status: TeamStatus | InvitationStatus | TeamMemberRole;
};

const labelMap: Record<string, string> = {
  NOT_REGISTERED: "Not Registered",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
  LEADER: "Leader",
  MEMBER: "Member",
};

export const TeamStatusBadge = ({ status }: TeamStatusBadgeProps) => {
  const colorMap = {
    NOT_REGISTERED: "default",
    PENDING_APPROVAL: "warning",
    APPROVED: "success",
    REJECTED: "error",
    PENDING: "warning",
    ACCEPTED: "success",
    CANCELLED: "default",
    EXPIRED: "error",
    LEADER: "primary",
    MEMBER: "default",
  } as const;

  return (
    <Chip
      size="small"
      label={labelMap[status]}
      color={colorMap[status]}
      sx={{ fontWeight: 800 }}
    />
  );
};