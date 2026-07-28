import type { SvgIconComponent } from "@mui/icons-material";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import Diversity3OutlinedIcon from "@mui/icons-material/Diversity3Outlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";

export type EditTab =
  | "INFO"
  | "TRACKS"
  | "TEAMS"
  | "ROUNDS"
  | "PROBLEMS"
  | "ASSIGNMENTS"
  | "CRITERIA"
  | "PRIZES";

/**
 * Per-tab visual tokens for the Edit Event workspace — mirrors the Create
 * Event wizard's `wizardUi.ts` so both flows share one design language.
 * `gradient` fills icon badges / active tab chips, `glow` is the matching
 * shadow tint, `text` colors the tab eyebrow, `soft` is a tinted surface.
 */
export type EditTabTheme = {
  value: EditTab;
  label: string;
  icon: SvgIconComponent;
  gradient: string;
  glow: string;
  text: string;
  soft: string;
};

export const EDIT_TABS: EditTabTheme[] = [
  {
    value: "INFO",
    label: "Info",
    icon: InfoOutlinedIcon,
    gradient: "from-blue-500 to-sky-400",
    glow: "shadow-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
    soft: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    value: "TRACKS",
    label: "Tracks",
    icon: RouteOutlinedIcon,
    gradient: "from-emerald-500 to-teal-400",
    glow: "shadow-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    soft: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    value: "TEAMS",
    label: "Teams",
    icon: GroupsOutlinedIcon,
    gradient: "from-fuchsia-500 to-purple-400",
    glow: "shadow-fuchsia-500/30",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    soft: "bg-fuchsia-50 dark:bg-fuchsia-500/10",
  },
  {
    value: "ROUNDS",
    label: "Rounds",
    icon: TimelineOutlinedIcon,
    gradient: "from-violet-500 to-indigo-400",
    glow: "shadow-violet-500/30",
    text: "text-violet-600 dark:text-violet-400",
    soft: "bg-violet-50 dark:bg-violet-500/10",
  },
  {
    value: "PROBLEMS",
    label: "Problem PDFs",
    icon: PictureAsPdfOutlinedIcon,
    gradient: "from-red-500 to-orange-400",
    glow: "shadow-red-500/30",
    text: "text-red-600 dark:text-red-400",
    soft: "bg-red-50 dark:bg-red-500/10",
  },
  {
    value: "ASSIGNMENTS",
    label: "Mentors & Judges",
    icon: Diversity3OutlinedIcon,
    gradient: "from-cyan-500 to-blue-400",
    glow: "shadow-cyan-500/30",
    text: "text-cyan-600 dark:text-cyan-400",
    soft: "bg-cyan-50 dark:bg-cyan-500/10",
  },
  {
    value: "CRITERIA",
    label: "Criteria",
    icon: ChecklistOutlinedIcon,
    gradient: "from-rose-500 to-pink-400",
    glow: "shadow-rose-500/30",
    text: "text-rose-600 dark:text-rose-400",
    soft: "bg-rose-50 dark:bg-rose-500/10",
  },
  {
    value: "PRIZES",
    label: "Prizes",
    icon: EmojiEventsOutlinedIcon,
    gradient: "from-amber-500 to-orange-400",
    glow: "shadow-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    soft: "bg-amber-50 dark:bg-amber-500/10",
  },
];

export function getEditTabTheme(tab: EditTab): EditTabTheme {
  return EDIT_TABS.find((item) => item.value === tab) ?? EDIT_TABS[0];
}

/**
 * Status pill tokens for the hero header. Pills sit on top of the full-strength
 * event banner, so they use a dark glass base (slate-950/60 + backdrop blur)
 * with a colored border/text/dot instead of a translucent color tint.
 */
export const EVENT_STATUS_PILLS: Record<
  string,
  { label: string; className: string; dotClassName: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "border-amber-400/40 bg-slate-950/60 text-amber-300",
    dotClassName: "bg-amber-400",
  },
  REGISTRATION: {
    label: "Registration",
    className: "border-sky-400/40 bg-slate-950/60 text-sky-300",
    dotClassName: "bg-sky-400",
  },
  ONGOING: {
    label: "Live",
    className: "border-emerald-400/40 bg-slate-950/60 text-emerald-300",
    dotClassName: "bg-emerald-400 animate-pulse",
  },
  JUDGING: {
    label: "Judging",
    className: "border-violet-400/40 bg-slate-950/60 text-violet-300",
    dotClassName: "bg-violet-400",
  },
  COMPLETED: {
    label: "Completed",
    className: "border-blue-400/40 bg-slate-950/60 text-blue-300",
    dotClassName: "bg-blue-400",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "border-rose-400/40 bg-slate-950/60 text-rose-300",
    dotClassName: "bg-rose-400",
  },
  ARCHIVED: {
    label: "Archived",
    className: "border-slate-400/40 bg-slate-950/60 text-slate-300",
    dotClassName: "bg-slate-400",
  },
};

/** Rounded-input styling shared by edit-event forms (same as the wizard). */
export const editFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
  },
};

export const editDateFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
  },
  "& .MuiInputLabel-root": {
    backgroundColor: "white",
    paddingInline: "4px",
  },
  ".dark & .MuiInputLabel-root": {
    backgroundColor: "#0f172a",
  },
};

/** Dark-slate dialog paper shared by every edit-event popup. */
export const editDialogPaperSx = {
  "& .MuiDialog-paper": {
    borderRadius: "20px",
    overflow: "hidden",
    backgroundImage: "none",
  },
} as const;
