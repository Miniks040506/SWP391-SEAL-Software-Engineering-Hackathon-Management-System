import Chip from "@mui/material/Chip";

type TeamStatusBadgeProps = {
  status?: string;
  memberCount?: number;
  maxMembers?: number;
};

function normalizeStatus(status?: string) {
  if (!status) return "";

  return status.toUpperCase();
}

function getStatusLabel(status?: string) {
  const normalized = normalizeStatus(status);

  const labelMap: Record<string, string> = {
    APPROVED: "Approved",
    PENDING: "Pending",
    PENDING_APPROVAL: "Pending Approval",
    REJECTED: "Rejected",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    LEADER: "Leader",
    MEMBER: "Member",
    TEAM_LEADER: "Team Leader",
  };

  return labelMap[normalized] ?? status;
}

export const TeamStatusBadge = ({
  status,
  memberCount,
  maxMembers = 5,
}: TeamStatusBadgeProps) => {
  const normalized = normalizeStatus(status);

  const colorMap = {
    APPROVED: "success",
    ACTIVE: "success",
    PENDING: "warning",
    PENDING_APPROVAL: "warning",
    REJECTED: "error",
    INACTIVE: "default",
    LEADER: "primary",
    TEAM_LEADER: "primary",
    MEMBER: "default",
  } as const;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status && (
        <Chip
          size="small"
          label={getStatusLabel(status)}
          color={colorMap[normalized as keyof typeof colorMap] ?? "default"}
          sx={{ fontWeight: 800 }}
        />
      )}

      {typeof memberCount === "number" && (
        <Chip
          size="small"
          label={`Members: ${memberCount}/${maxMembers}`}
          variant="outlined"
          sx={{ fontWeight: 800 }}
        />
      )}
    </div>
  );
};