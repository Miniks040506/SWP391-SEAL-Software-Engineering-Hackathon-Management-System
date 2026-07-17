import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";

import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import type { MentorSubmissionStatus } from "@/types/submission.types";

export type MentorSubmissionFilters = {
  search?: string;
  status?: MentorSubmissionStatus;
  roundId?: string;
};

type Props = {
  filters: MentorSubmissionFilters;
  onChange: (filters: MentorSubmissionFilters) => void;
  rounds?: { id: string; name: string }[];
};

const SUBMISSION_STATUSES: MentorSubmissionStatus[] = [
  "SUBMITTED",
  "LATE",
  "DISQUALIFIED",
];

const filterInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "transparent",
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: "2px" },
  },
  ".dark & .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#334155" },
    "&:hover fieldset": { borderColor: "#475569" },
  },
};

export const MentorSubmissionFilterBar = ({ filters, onChange, rounds = [] }: Props) => {
  const [localSearch, setLocalSearch] = useState(filters.search || "");

  // Debounce search 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      const cleanSearch = localSearch.trim();
      const currentSearch = filters.search || "";
      if (cleanSearch !== currentSearch) {
        onChange({ ...filters, search: cleanSearch || undefined });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, filters, onChange]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleStatusChange = (e: SelectChangeEvent<string>) => {
    onChange({
      ...filters,
      status: (e.target.value || undefined) as MentorSubmissionStatus | undefined,
    });
  };

  const handleRoundChange = (e: SelectChangeEvent<string>) => {
    onChange({ ...filters, roundId: e.target.value || undefined });
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    onChange({ search: undefined, status: undefined, roundId: undefined });
  };

  const hasActiveFilters = Boolean(filters.search || filters.status || filters.roundId);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-[#1e293b]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search Bar */}
        <div className="flex-1">
          <TextField
            fullWidth
            size="small"
            placeholder="Search by team name..."
            value={localSearch}
            onChange={handleTextChange}
            sx={filterInputSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" className="text-gray-400" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </div>

        {/* Dropdowns & Clear Button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <FormControl size="small" className="w-full sm:w-48">
            <Select
              displayEmpty
              value={filters.roundId || ""}
              onChange={handleRoundChange}
              sx={filterInputSx}
              renderValue={(selected) => {
                if (!selected) return <span className="font-medium text-gray-500">All Rounds</span>;
                const found = rounds.find((r) => r.id === selected);
                return <span className="text-gray-900 dark:text-white">{found?.name || "Unknown Round"}</span>;
              }}
            >
              <MenuItem value="">All Rounds</MenuItem>
              {rounds.map((r) => (
                <MenuItem key={r.id} value={r.id} className="font-medium">
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" className="w-full sm:w-48">
            <Select
              displayEmpty
              value={filters.status || ""}
              onChange={handleStatusChange}
              sx={filterInputSx}
              renderValue={(selected) => {
                if (!selected) return <span className="font-medium text-gray-500">All Statuses</span>;
                return <span className="text-gray-900 dark:text-white">{selected}</span>;
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {SUBMISSION_STATUSES.map((status) => (
                <MenuItem key={status} value={status} className="font-medium">
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              startIcon={<FilterAltOffIcon />}
              variant="text"
              color="error"
              sx={{
                textTransform: "none",
                fontWeight: 800,
                borderRadius: "10px",
                whiteSpace: "nowrap",
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
