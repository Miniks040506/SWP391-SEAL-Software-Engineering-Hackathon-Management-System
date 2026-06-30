import Chip from "@mui/material/Chip";

type PrizeScopeBadgeProps = {
  trackName?: string;
};

export const PrizeScopeBadge = ({ trackName }: PrizeScopeBadgeProps) => {
  if (trackName) {
    return <Chip label={`Track: ${trackName}`} size="small" variant="outlined" color="primary" />;
  }
  return <Chip label="Overall" size="small" variant="outlined" color="secondary" />;
};
