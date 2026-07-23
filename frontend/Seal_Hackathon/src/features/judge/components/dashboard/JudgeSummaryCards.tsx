import type { ReactNode } from "react";

import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";

import type { JudgeDashboardData } from "../../schemas/judgeDashboard.schema";
import { JudgeStatTile, type JudgeStatTileAccent } from "../common/JudgeStatTile";

interface JudgeSummaryCardsProps {
  cards: JudgeDashboardData["summaryCards"];
}

const ICON_BY_TYPE: Record<string, ReactNode> = {
  round: <EventNoteOutlinedIcon sx={{ fontSize: 22 }} />,
  pending: <PendingActionsOutlinedIcon sx={{ fontSize: 22 }} />,
  completed: <TaskAltOutlinedIcon sx={{ fontSize: 22 }} />,
  deadline: <ScheduleOutlinedIcon sx={{ fontSize: 22 }} />,
};

const ACCENT_BY_TYPE: Record<string, JudgeStatTileAccent> = {
  round: "indigo",
  pending: "amber",
  completed: "emerald",
  deadline: "rose",
};

export const JudgeSummaryCards = ({ cards }: JudgeSummaryCardsProps) => {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <JudgeStatTile
          key={card.title}
          title={card.title}
          value={card.value}
          description={card.description}
          icon={ICON_BY_TYPE[card.iconType] ?? ICON_BY_TYPE.round}
          accent={ACCENT_BY_TYPE[card.iconType] ?? "blue"}
          stagger={index + 1}
        />
      ))}
    </section>
  );
};
