import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { SelectChangeEvent } from "@mui/material";

type VarianceFilterBarProps = {
  rounds: { id: string; name: string }[];
  tracks: { id: string; name: string }[];
  selectedRoundId: string;
  selectedTrackId: string;
  selectedCriteriaType: string;
  selectedJudgeType: string;
  onRoundChange: (e: SelectChangeEvent) => void;
  onTrackChange: (e: SelectChangeEvent) => void;
  onCriteriaTypeChange: (e: SelectChangeEvent) => void;
  onJudgeTypeChange: (e: SelectChangeEvent) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  roundsLoading?: boolean;
  roundsError?: boolean;
  tracksLoading?: boolean;
  tracksError?: boolean;
};

const CRITERIA_TYPES = [
  "All",
  "Technical",
  "Soft",
  "Presentation",
  "Innovation",
  "Business",
  "Process",
];

const JUDGE_TYPES = ["All", "Internal", "External", "Guest"];

export function VarianceFilterBar({
  rounds,
  tracks,
  selectedRoundId,
  selectedTrackId,
  selectedCriteriaType,
  selectedJudgeType,
  onRoundChange,
  onTrackChange,
  onCriteriaTypeChange,
  onJudgeTypeChange,
  onRefresh,
  isLoading,
  roundsLoading,
  roundsError,
  tracksLoading,
  tracksError,
}: VarianceFilterBarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        alignItems: "center",
        mb: 4,
        p: 2,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <FormControl size="small" sx={{ minWidth: 150 }} error={roundsError}>
        <InputLabel>{roundsError ? "Error loading" : "Round"}</InputLabel>
        <Select
          value={selectedRoundId}
          label={roundsError ? "Error loading" : "Round"}
          onChange={onRoundChange}
          disabled={roundsLoading || roundsError}
        >
          <MenuItem value="All">{roundsLoading ? "Loading..." : "All"}</MenuItem>
          {rounds.map((r) => (
            <MenuItem key={r.id} value={r.id}>
              {r.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }} error={tracksError}>
        <InputLabel>{tracksError ? "Error loading" : "Track"}</InputLabel>
        <Select
          value={selectedTrackId}
          label={tracksError ? "Error loading" : "Track"}
          onChange={onTrackChange}
          disabled={tracksLoading || tracksError}
        >
          <MenuItem value="All">{tracksLoading ? "Loading..." : "All"}</MenuItem>
          {tracks.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Criteria Type</InputLabel>
        <Select
          value={selectedCriteriaType}
          label="Criteria Type"
          onChange={onCriteriaTypeChange}
        >
          {CRITERIA_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Judge Type</InputLabel>
        <Select
          value={selectedJudgeType}
          label="Judge Type"
          onChange={onJudgeTypeChange}
        >
          {JUDGE_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ flexGrow: 1 }} />

      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={onRefresh}
        disabled={isLoading}
      >
        Refresh
      </Button>
    </Box>
  );
}
