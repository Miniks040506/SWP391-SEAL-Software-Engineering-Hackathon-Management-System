import {
  CheckCircleOutlined,
  CancelOutlined,
  PeopleOutlined,
  EditOutlined,
} from "@mui/icons-material";

interface AdvancementSummaryCardsProps {
  advancedCount: number;
  eliminatedCount: number;
  totalCount: number;
  overrideCount: number;
}

export function AdvancementSummaryCards({
  advancedCount,
  eliminatedCount,
  totalCount,
  overrideCount,
}: AdvancementSummaryCardsProps) {
  const cards = [
    {
      label: "Advanced",
      value: advancedCount,
      icon: <CheckCircleOutlined className="text-green-500" />,
      color:
        "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950",
      textColor: "text-green-700 dark:text-green-300",
    },
    {
      label: "Eliminated",
      value: eliminatedCount,
      icon: <CancelOutlined className="text-red-500" />,
      color: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950",
      textColor: "text-red-700 dark:text-red-300",
    },
    {
      label: "Total Teams",
      value: totalCount,
      icon: <PeopleOutlined className="text-blue-500" />,
      color: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950",
      textColor: "text-blue-700 dark:text-blue-300",
    },
    {
      label: "Manual Overrides",
      value: overrideCount,
      icon: <EditOutlined className="text-amber-500" />,
      color:
        "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950",
      textColor: "text-amber-700 dark:text-amber-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border p-4 flex flex-col gap-2 ${card.color}`}
        >
          <div className="flex items-center gap-2">
            {card.icon}
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {card.label}
            </span>
          </div>
          <span className={`text-2xl font-bold ${card.textColor}`}>
            {card.value}
          </span>
        </div>
      ))}
    </div>
  );
}
