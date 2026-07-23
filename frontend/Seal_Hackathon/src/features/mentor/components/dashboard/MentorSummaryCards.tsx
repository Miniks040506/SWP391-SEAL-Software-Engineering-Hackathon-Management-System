import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

import { MentorStatTile, type MentorStatTileAccent } from "../common/MentorStatTile";

export type MentorSummaryCard = {
  title: string;
  value: string | number;
  description: string;
  iconType: "event" | "track" | "team" | "feedback" | "deadline";
  color: string;
};

type MentorSummaryCardsProps = {
  cards: MentorSummaryCard[];
};

function getSummaryIcon(iconType: MentorSummaryCard["iconType"]) {
  switch (iconType) {
    case "event": return <EventAvailableOutlinedIcon />;
    case "track": return <AssignmentOutlinedIcon />;
    case "team": return <GroupsOutlinedIcon />;
    case "feedback": return <RateReviewOutlinedIcon />;
    case "deadline": return <AccessTimeOutlinedIcon />;
    default: return <EventAvailableOutlinedIcon />;
  }
}

const ACCENT_BY_ICON: Record<MentorSummaryCard["iconType"], MentorStatTileAccent> = {
  event: "blue",
  track: "indigo",
  team: "emerald",
  feedback: "amber",
  deadline: "rose",
};

export const MentorSummaryCards = ({ cards }: MentorSummaryCardsProps) => {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card, index) => (
        <MentorStatTile
          key={card.title}
          title={card.title}
          value={Number(card.value) || 0}
          description={card.description}
          icon={getSummaryIcon(card.iconType)}
          accent={ACCENT_BY_ICON[card.iconType]}
          stagger={index + 1}
        />
      ))}
    </section>
  );
};
