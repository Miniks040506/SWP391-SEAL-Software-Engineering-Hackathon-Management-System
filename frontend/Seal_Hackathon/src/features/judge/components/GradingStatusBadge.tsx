interface GradingStatusBadgeProps {
  status: string;
}

export const GradingStatusBadge = ({ status }: GradingStatusBadgeProps) => {
  let style = "text-gray-600 bg-gray-50 border border-gray-200";
  let label = "Unknown";

  switch (status) {
    case "PENDING":
      style = "text-gray-600 bg-gray-50 border border-gray-200";
      label = "Not started";
      break;
    case "DRAFT_SAVED":
      style = "text-blue-600 bg-blue-50 border border-blue-200";
      label = "Draft saved";
      break;
    case "SUBMITTED":
      style = "text-green-600 bg-green-50 border border-green-200";
      label = "Submitted";
      break;
    case "LOCKED":
      style = "text-purple-600 bg-purple-50 border border-purple-200";
      label = "Locked";
      break;
  }

  return (
    <span
      className={`px-2.5 py-1 rounded text-xs font-bold tracking-tight shadow-sm ${style}`}
    >
      {label}
    </span>
  );
};
