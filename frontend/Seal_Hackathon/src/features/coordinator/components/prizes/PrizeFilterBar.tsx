import { useState, useEffect } from "react";
import {
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Button,
  type SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import type { TrackResponse } from "@/types/track.types";

export type PrizeFilterState = {
  search: string;
  trackId: string;
  status: string;
};

export const defaultPrizeFilters: PrizeFilterState = {
  search: "",
  trackId: "",
  status: "",
};

type Props = {
  filters: PrizeFilterState;
  onChange: (filters: PrizeFilterState) => void;
  tracks?: TrackResponse[];
};

export function PrizeFilterBar({ filters, onChange, tracks = [] }: Props) {
  const [localSearch, setLocalSearch] = useState(filters.search || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      const cleanSearch = localSearch.trim();
      if (cleanSearch !== filters.search) {
        onChange({ ...filters, search: cleanSearch });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, filters, onChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleStatusChange = (e: SelectChangeEvent<string>) => {
    onChange({ ...filters, status: e.target.value });
  };

  const handleTrackChange = (e: SelectChangeEvent<string>) => {
    onChange({ ...filters, trackId: e.target.value });
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    onChange({ ...defaultPrizeFilters });
  };

  const hasActiveFilters = Boolean(filters.search || filters.status || filters.trackId);

  return (
    <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-t-2xl">
      <div className="flex flex-col gap-4 md:gap-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <TextField
              fullWidth
              size="small"
              placeholder="Search by prize name, sponsor, or team..."
              value={localSearch}
              onChange={handleSearchChange}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "10px" },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </div>

          <div className="w-full sm:w-48 shrink-0">
            <FormControl size="small" fullWidth>
              <Select
                displayEmpty
                value={filters.status}
                onChange={handleStatusChange}
                sx={{ borderRadius: "10px" }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="AWARDED">Awarded</MenuItem>
                <MenuItem value="UNAWARDED">Unawarded</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="w-full sm:w-56 shrink-0">
            <FormControl size="small" fullWidth>
              <Select
                displayEmpty
                value={filters.trackId}
                onChange={handleTrackChange}
                sx={{ borderRadius: "10px" }}
              >
                <MenuItem value="">All Scopes</MenuItem>
                <MenuItem value="EVENT">Whole Event Prizes</MenuItem>
                {tracks.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              startIcon={<FilterAltOffIcon />}
              variant="text"
              color="error"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                minWidth: "120px",
                borderRadius: "10px",
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function applyPrizeFilters(
  prizes: import("@/types/prize.types").PrizeResponse[],
  filters: PrizeFilterState
) {
  return prizes.filter((p) => {
    // 1. Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchTeam = p.awardedTeamName?.toLowerCase().includes(q);
      const matchSponsor = p.sponsorName?.toLowerCase().includes(q);
      if (!matchTitle && !matchTeam && !matchSponsor) return false;
    }

    // 2. Track filter
    if (filters.trackId) {
      if (filters.trackId === "EVENT") {
        if (p.trackId) return false; // Must be whole event
      } else {
        if (p.trackId !== filters.trackId) return false;
      }
    }

    // 3. Status filter
    if (filters.status) {
      const isAwarded = Boolean(p.awardedTeamId);
      if (filters.status === "AWARDED" && !isAwarded) return false;
      if (filters.status === "UNAWARDED" && isAwarded) return false;
    }

    return true;
  });
}
