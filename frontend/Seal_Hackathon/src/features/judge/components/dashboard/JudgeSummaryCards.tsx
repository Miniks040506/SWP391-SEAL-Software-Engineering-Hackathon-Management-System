import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

export type JudgeSummaryCard = {
  title: string;
  value: string | number;
  description: string;
  iconType: "event" | "round" | "pending" | "completed" | "deadline";
  color: string;
};

type JudgeSummaryCardsProps = {
  cards: JudgeSummaryCard[];
};

function getSummaryIcon(iconType: JudgeSummaryCard["iconType"]) {
  switch (iconType) {
    case "event": return <EventAvailableOutlinedIcon />;
    case "round": return <FactCheckOutlinedIcon />;
    case "pending": return <PendingActionsOutlinedIcon />;
    case "completed": return <AssignmentTurnedInOutlinedIcon />;
    case "deadline": return <AccessTimeOutlinedIcon />;
    default: return <EventAvailableOutlinedIcon />;
  }
}

export const JudgeSummaryCards = ({ cards }: JudgeSummaryCardsProps) => {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item) => (
        <Card key={item.title} variant="outlined" className="border-gray-100 dark:border-slate-700 dark:bg-[#1e293b]">
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">{item.title}</p>
                <h2 className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">{item.value}</h2>
                <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">{item.description}</p>
              </div>
              <div className={`rounded-2xl p-3 ${item.color}`}>
                {getSummaryIcon(item.iconType)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
};