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
      icon: <CheckCircleOutlined className="text-emerald-600 dark:text-emerald-400" />,
      textColor: "text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Eliminated",
      value: eliminatedCount,
      icon: <CancelOutlined className="text-rose-600 dark:text-rose-400" />,
      textColor: "text-rose-700 dark:text-rose-300",
    },
    {
      label: "Total Teams",
      value: totalCount,
      icon: <PeopleOutlined className="text-blue-600 dark:text-blue-400" />,
      textColor: "text-blue-700 dark:text-blue-300",
    },
    {
      label: "Manual Overrides",
      value: overrideCount,
      icon: <EditOutlined className="text-amber-600 dark:text-amber-400" />,
      textColor: "text-amber-700 dark:text-amber-300",
    },
  ];

  return (
    <dl className="mb-8 grid grid-cols-2 border-y border-slate-200 dark:border-slate-800 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex min-h-28 flex-col justify-between border-b border-slate-200 px-4 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 dark:border-slate-800"
        >
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {card.icon}
            {card.label}
          </dt>
          <dd className={`font-mono text-4xl font-extrabold tracking-tight ${card.textColor}`}>
            {card.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
