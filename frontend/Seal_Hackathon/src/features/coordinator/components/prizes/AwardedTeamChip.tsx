import Chip from "@mui/material/Chip";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

type AwardedTeamChipProps = {
  teamName?: string;
};

export const AwardedTeamChip = ({ teamName }: AwardedTeamChipProps) => {
  if (!teamName) {
    return <span className="text-gray-400 italic text-sm">Not awarded</span>;
  }
  
  return (
    <Chip 
      icon={<EmojiEventsIcon />} 
      label={teamName} 
      size="small" 
      color="success" 
      variant="filled" 
    />
  );
};
