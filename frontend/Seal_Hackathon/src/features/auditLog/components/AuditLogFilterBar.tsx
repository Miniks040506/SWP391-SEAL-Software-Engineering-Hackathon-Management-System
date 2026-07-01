import { useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Collapse from "@mui/material/Collapse";
import type { GetAuditLogsParams } from "@/types/system.types";

type Props = {
  filters: GetAuditLogsParams;
  onChange: (newFilters: GetAuditLogsParams) => void;
  availableActions: string[];
};

export const AuditLogFilterBar = ({ filters, onChange, availableActions }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const handleClear = () => {
    onChange({ page: 0, size: 20 });
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-700">
      {/* Primary Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <TextField
          select
          size="small"
          label="Action Type"
          value={filters.actionType || "ALL"}
          onChange={(e) => onChange({ ...filters, actionType: e.target.value === "ALL" ? undefined : e.target.value, page: 0 })}
          className="w-full md:w-64"
        >
          <MenuItem value="ALL">All Actions</MenuItem>
          {availableActions.map((action) => (
            <MenuItem key={action} value={action}>
              {action.replace(/_/g, " ")}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          label="Actor ID"
          placeholder="Filter by actor ID..."
          value={filters.actorId || ""}
          onChange={(e) => onChange({ ...filters, actorId: e.target.value || undefined, page: 0 })}
          className="flex-1"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            }
          }}
        />

        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
          <Button
            variant="outlined"
            onClick={() => setExpanded(!expanded)}
            startIcon={<FilterAltOutlinedIcon />}
            endIcon={expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            className="flex-1 md:flex-none"
            sx={{ textTransform: "none", fontWeight: 600, height: "40px" }}
          >
            More Filters
          </Button>
          {expanded && (
            <Button
              variant="text"
              color="inherit"
              onClick={handleClear}
              startIcon={<ClearOutlinedIcon />}
              sx={{ textTransform: "none", fontWeight: 600, height: "40px" }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <Collapse in={expanded}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <TextField
            size="small"
            label="Event ID"
            value={filters.eventId || ""}
            onChange={(e) => onChange({ ...filters, eventId: e.target.value || undefined, page: 0 })}
          />
          <TextField
            size="small"
            label="Team ID"
            value={filters.teamId || ""}
            onChange={(e) => onChange({ ...filters, teamId: e.target.value || undefined, page: 0 })}
          />
          <TextField
            size="small"
            label="Submission ID"
            value={filters.submissionId || ""}
            onChange={(e) => onChange({ ...filters, submissionId: e.target.value || undefined, page: 0 })}
          />
          <TextField
            size="small"
            label="Target Table"
            value={filters.targetTable || ""}
            onChange={(e) => onChange({ ...filters, targetTable: e.target.value || undefined, page: 0 })}
          />
          <TextField
            size="small"
            label="Target ID"
            value={filters.targetId || ""}
            onChange={(e) => onChange({ ...filters, targetId: e.target.value || undefined, page: 0 })}
          />
          <TextField
            select
            size="small"
            label="Page Size"
            value={filters.size || 20}
            onChange={(e) => onChange({ ...filters, size: Number(e.target.value), page: 0 })}
          >
            <MenuItem value={10}>10 per page</MenuItem>
            <MenuItem value={20}>20 per page</MenuItem>
            <MenuItem value={50}>50 per page</MenuItem>
            <MenuItem value={100}>100 per page</MenuItem>
          </TextField>
          <TextField
            type="datetime-local"
            size="small"
            label="From Date"
            value={filters.fromDate || ""}
            onChange={(e) => onChange({ ...filters, fromDate: e.target.value || undefined, page: 0 })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="datetime-local"
            size="small"
            label="To Date"
            value={filters.toDate || ""}
            onChange={(e) => onChange({ ...filters, toDate: e.target.value || undefined, page: 0 })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </div>
      </Collapse>
    </div>
  );
};