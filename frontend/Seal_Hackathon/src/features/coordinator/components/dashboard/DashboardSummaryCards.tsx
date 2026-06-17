import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import GradingOutlinedIcon from "@mui/icons-material/GradingOutlined";

export type SummaryCardType = {
  title: string;
  value: string | number;
  description: string;
  iconType: "event" | "team" | "submission" | "grading";
  color: string;
};

type Props = {
  cards: SummaryCardType[];
  isLoading?: boolean;
};

const getSummaryIcon = (iconType: SummaryCardType["iconType"]) => {
  switch (iconType) {
    case "event": return <EventAvailableOutlinedIcon />;
    case "team": return <GroupsOutlinedIcon />;
    case "submission": return <UploadFileOutlinedIcon />;
    case "grading": return <GradingOutlinedIcon />;
    default: return <EventAvailableOutlinedIcon />;
  }
};

export function DashboardSummaryCards({ cards, isLoading }: Props) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item) => (
        <Card key={item.title} variant="outlined" className="border-gray-100 dark:border-slate-700 dark:bg-[#1e293b]">
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
                  {item.title}
                </p>
                <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                  {isLoading && item.title === "Active Events" ? <CircularProgress size={26} /> : item.value}
                </h2>
                <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">
                  {item.description}
                </p>
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
}