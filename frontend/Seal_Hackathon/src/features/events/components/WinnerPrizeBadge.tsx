import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Tooltip } from "@mui/material";

type WinnerPrizeBadgeProps = {
  prizeTitle: string;
  className?: string;
};

export const WinnerPrizeBadge = ({
  prizeTitle,
  className = "",
}: WinnerPrizeBadgeProps) => {
  return (
    <Tooltip title={`Winner: ${prizeTitle}`} arrow placement="top">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-sm dark:bg-amber-500/20 dark:text-amber-400 ${className}`}
      >
        <EmojiEventsIcon fontSize="small" />
      </div>
    </Tooltip>
  );
};
