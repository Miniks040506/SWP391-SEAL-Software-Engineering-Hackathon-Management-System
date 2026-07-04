type BadgeType =
  | "ADVANCED"
  | "NOT_ADVANCED"
  | "DISQUALIFIED"
  | "MANUAL_REVIEW"
  | "PUBLISHED"
  | "UNPUBLISHED";

interface RankingStatusBadgeProps {
  type: BadgeType;
}

export const RankingStatusBadge = ({ type }: RankingStatusBadgeProps) => {
  let label = "";
  let twColor = "";

  switch (type) {
    case "ADVANCED":
      label = "Advanced";
      twColor =
        "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30";
      break;
    case "NOT_ADVANCED":
      label = "Not advanced";
      twColor =
        "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800";
      break;
    case "DISQUALIFIED":
      label = "Disqualified";
      twColor = "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30";
      break;
    case "MANUAL_REVIEW":
      label = "Manual review";
      twColor =
        "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30";
      break;
    case "PUBLISHED":
      label = "Published";
      twColor =
        "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30";
      break;
    case "UNPUBLISHED":
      label = "Unpublished";
      twColor =
        "text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/30";
      break;
    default:
      return null;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${twColor}`}
    >
      {label}
    </span>
  );
};
