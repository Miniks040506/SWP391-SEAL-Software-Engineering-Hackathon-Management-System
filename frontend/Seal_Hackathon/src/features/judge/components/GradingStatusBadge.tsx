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
    case "READY":
      style = "text-amber-600 bg-amber-50 border border-amber-200";
      label = "Ready";
      break;
    case "GRADED":
      style = "text-green-600 bg-green-50 border border-green-200";
      label = "Graded";
      break;
    default:
      style = "text-gray-600 bg-gray-50 border border-gray-200";
      label = "Unknown";
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
