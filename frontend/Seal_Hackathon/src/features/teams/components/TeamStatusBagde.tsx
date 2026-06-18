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
    FORMING: "Forming",
    REGISTERED: "Registered",
    COMPETING: "Competing",
    ADVANCED: "Advanced",
    ELIMINATED: "Eliminated",
    WINNER: "Winner",
    // legacy fallbacks
    APPROVED: "Registered",
    PENDING: "Forming",
    PENDING_APPROVAL: "Forming",
    REJECTED: "Eliminated",
    ACTIVE: "Competing",
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
    FORMING: "warning",
    REGISTERED: "info",
    COMPETING: "primary",
    ADVANCED: "success",
    ELIMINATED: "error",
    WINNER: "success",
    // legacy fallbacks
    APPROVED: "success",
    PENDING: "warning",
    PENDING_APPROVAL: "warning",
    REJECTED: "error",
    ACTIVE: "success",
    INACTIVE: "default",
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
          label={`${memberCount}/${maxMembers} members`}
          variant="outlined"
          color={colorMap[normalized as keyof typeof colorMap] ?? "default"}
          sx={{ fontWeight: 800 }}
        />
      )}
    </div>
  );
};