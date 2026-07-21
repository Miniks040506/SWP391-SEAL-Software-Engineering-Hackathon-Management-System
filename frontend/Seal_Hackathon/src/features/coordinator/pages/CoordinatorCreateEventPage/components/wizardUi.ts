import type { SvgIconComponent } from "@mui/icons-material";

import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";

/**
 * Per-step visual tokens for the Create Event wizard.
 * `gradient` fills icon badges / active stepper dots, `glow` is the matching
 * shadow tint, `text` colors the step eyebrow, `soft` is a tinted surface.
 */
export type WizardStepTheme = {
  label: string;
  icon: SvgIconComponent;
  gradient: string;
  glow: string;
  text: string;
  soft: string;
};

export const WIZARD_STEPS: WizardStepTheme[] = [
  {
    label: "Event Details",
    icon: EventNoteOutlinedIcon,
    gradient: "from-blue-500 to-sky-400",
    glow: "shadow-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
    soft: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    label: "Track",
    icon: RouteOutlinedIcon,
    gradient: "from-emerald-500 to-teal-400",
    glow: "shadow-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    soft: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    label: "Prizes",
    icon: EmojiEventsOutlinedIcon,
    gradient: "from-amber-500 to-orange-400",
    glow: "shadow-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    soft: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    label: "Round",
    icon: TimelineOutlinedIcon,
    gradient: "from-violet-500 to-indigo-400",
    glow: "shadow-violet-500/30",
    text: "text-violet-600 dark:text-violet-400",
    soft: "bg-violet-50 dark:bg-violet-500/10",
  },
  {
    label: "Mentors & Judges",
    icon: GroupsOutlinedIcon,
    gradient: "from-cyan-500 to-blue-400",
    glow: "shadow-cyan-500/30",
    text: "text-cyan-600 dark:text-cyan-400",
    soft: "bg-cyan-50 dark:bg-cyan-500/10",
  },
  {
    label: "Event Criteria",
    icon: ChecklistOutlinedIcon,
    gradient: "from-rose-500 to-pink-400",
    glow: "shadow-rose-500/30",
    text: "text-rose-600 dark:text-rose-400",
    soft: "bg-rose-50 dark:bg-rose-500/10",
  },
];

export const wizardFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
  },
};

export const wizardDateFieldSx = {
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

/** Tinted date-label variant for fields sitting on soft (slate-50) surfaces. */
export const wizardDateFieldOnSoftSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    backgroundColor: "white",
  },
  "& .MuiInputLabel-root": {
    backgroundColor: "white",
    paddingInline: "4px",
    borderRadius: "6px",
  },
  ".dark & .MuiOutlinedInput-root": {
    backgroundColor: "#0f172a",
  },
  ".dark & .MuiInputLabel-root": {
    backgroundColor: "#0f172a",
  },
};
