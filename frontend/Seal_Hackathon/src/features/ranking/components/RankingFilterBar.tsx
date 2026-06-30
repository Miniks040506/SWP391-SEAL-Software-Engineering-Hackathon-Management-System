import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

interface FilterOption {
  id: string;
  name: string;
}

interface RankingFilterBarProps {
  rounds: FilterOption[];
  tracks: FilterOption[];
  selectedRoundId: string;
  selectedTrackId: string;
  onRoundChange: (roundId: string) => void;
  onTrackChange: (trackId: string) => void;
  showTrackFilter?: boolean;
}

export const RankingFilterBar = ({
  rounds,
  tracks,
  selectedRoundId,
  selectedTrackId,
  onRoundChange,
  onTrackChange,
  showTrackFilter = true,
}: RankingFilterBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="round-select-label">Round</InputLabel>
        <Select
          labelId="round-select-label"
          value={selectedRoundId}
          label="Round"
          onChange={(e) => onRoundChange(e.target.value)}
          sx={{ borderRadius: "8px" }}
        >
          <MenuItem value="all">
            <em>All Rounds</em>
          </MenuItem>
          {rounds.map((round) => (
            <MenuItem key={round.id} value={round.id}>
              {round.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {showTrackFilter && (
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="track-select-label">Track</InputLabel>
          <Select
            labelId="track-select-label"
            value={selectedTrackId}
            label="Track"
            onChange={(e) => onTrackChange(e.target.value)}
            sx={{ borderRadius: "8px" }}
          >
            <MenuItem value="all">
              <em>All Tracks</em>
            </MenuItem>
            {tracks.map((track) => (
              <MenuItem key={track.id} value={track.id}>
                {track.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </div>
  );
};
