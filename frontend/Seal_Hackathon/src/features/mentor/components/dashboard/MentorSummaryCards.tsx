import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import type { MentorSummaryCard } from "../../schemas/mentorDashboard.schema";

type MentorSummaryCardsProps = {
  cards: MentorSummaryCard[];
};

function getSummaryIcon(iconType: MentorSummaryCard["iconType"]) {
  switch (iconType) {
    case "event":
      return <EventAvailableOutlinedIcon />;
    case "track":
      return <AssignmentOutlinedIcon />;
    case "team":
      return <GroupsOutlinedIcon />;
    case "feedback":
      return <RateReviewOutlinedIcon />;
    case "deadline":
      return <AccessTimeOutlinedIcon />;
    default:
      return <EventAvailableOutlinedIcon />;
  }
}

export const MentorSummaryCards = ({ cards }: MentorSummaryCardsProps) => {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Card
          key={card.title}
          variant="outlined"
          className="border-gray-100 dark:border-slate-700 dark:bg-[#1e293b]"
        >
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
                  {card.title}
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">
                  {card.value}
                </h2>

                <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">
                  {card.description}
                </p>
              </div>

              <div className={`rounded-2xl p-3 ${card.color}`}>
                {getSummaryIcon(card.iconType)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
};