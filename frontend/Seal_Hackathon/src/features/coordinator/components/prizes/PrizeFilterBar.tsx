import { useState, useEffect } from "react";
import {
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
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

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "AWARDED", label: "Awarded" },
  { value: "UNAWARDED", label: "Unawarded" },
];

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

  const handleTrackChange = (e: SelectChangeEvent<string>) => {
    onChange({ ...filters, trackId: e.target.value });
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    onChange({ ...defaultPrizeFilters });
  };

  const hasActiveFilters = Boolean(filters.search || filters.status || filters.trackId);

  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 bg-white p-4 text-slate-800 md:flex-row md:items-center md:p-5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      {/* Search */}
      <div className="flex-1">
        <TextField
          fullWidth
          size="small"
          placeholder="Search by prize, sponsor, or team..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
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

      {/* Status segmented pills */}
      <div className="inline-flex shrink-0 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = filters.status === opt.value;
          return (
            <button
              key={opt.value || "ALL"}
              type="button"
              onClick={() => onChange({ ...filters, status: opt.value })}
              className={[
                "cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                isActive
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Scope select */}
      <div className="w-full shrink-0 md:w-52">
        <FormControl size="small" fullWidth>
          <Select
            displayEmpty
            value={filters.trackId}
            onChange={handleTrackChange}
            sx={{ borderRadius: "12px" }}
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
        <button
          type="button"
          onClick={handleClearFilters}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 dark:text-rose-400 dark:hover:bg-rose-500/10"
        >
          <FilterAltOffIcon sx={{ fontSize: 16 }} />
          Clear
        </button>
      )}
    </div>
  );
}

export function applyPrizeFilters(
  prizes: import("@/types/prize.types").PrizeResponse[],
  filters: PrizeFilterState,
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
