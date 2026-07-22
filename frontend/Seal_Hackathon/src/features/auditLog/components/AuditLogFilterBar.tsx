import { useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Collapse from "@mui/material/Collapse";
import { filterTextFieldSx } from "@/features/admin/schemas/admin.schema";
import type { GetAuditLogsParams } from "@/types/system.types";

type Props = {
  filters: GetAuditLogsParams;
  onChange: (newFilters: GetAuditLogsParams) => void;
  availableActions: string[];
};

export const AuditLogFilterBar = ({
  filters,
  onChange,
  availableActions,
}: Props) => {
  const [expanded, setExpanded] = useState(false);

  const handleClear = () => {
    onChange({ page: 0, size: 20 });
  };

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
          <FilterAltOutlinedIcon
            className="text-blue-500"
            sx={{ fontSize: 20 }}
          />
        </span>
        <div>
          <h2 className="font-extrabold text-slate-900 dark:text-white">
            Filter activity
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Narrow the log by action, actor or affected record.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-4 md:flex-row">
        <TextField
          select
          size="small"
          label="Action Type"
          value={filters.actionType || "ALL"}
          onChange={(e) =>
            onChange({
              ...filters,
              actionType: e.target.value === "ALL" ? undefined : e.target.value,
              page: 0,
            })
          }
          className="w-full md:w-64"
          sx={filterTextFieldSx}
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
          onChange={(e) =>
            onChange({
              ...filters,
              actorId: e.target.value || undefined,
              page: 0,
            })
          }
          className="flex-1"
          sx={filterTextFieldSx}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <div className="flex w-full gap-2 md:w-auto">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] md:flex-none dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10 dark:hover:text-blue-300 motion-reduce:active:scale-100"
          >
            <FilterAltOutlinedIcon sx={{ fontSize: 18 }} />
            More Filters
            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </button>
          {expanded && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <ClearOutlinedIcon sx={{ fontSize: 18 }} />
              Clear
            </button>
          )}
        </div>
      </div>

      <Collapse in={expanded}>
        <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 md:grid-cols-3 dark:border-slate-800">
          <TextField
            size="small"
            label="Event ID"
            value={filters.eventId || ""}
            onChange={(e) =>
              onChange({
                ...filters,
                eventId: e.target.value || undefined,
                page: 0,
              })
            }
            sx={filterTextFieldSx}
          />
          <TextField
            size="small"
            label="Team ID"
            value={filters.teamId || ""}
            onChange={(e) =>
              onChange({
                ...filters,
                teamId: e.target.value || undefined,
                page: 0,
              })
            }
            sx={filterTextFieldSx}
          />
          <TextField
            size="small"
            label="Submission ID"
            value={filters.submissionId || ""}
            onChange={(e) =>
              onChange({
                ...filters,
                submissionId: e.target.value || undefined,
                page: 0,
              })
            }
            sx={filterTextFieldSx}
          />
          <TextField
            size="small"
            label="Target Table"
            value={filters.targetTable || ""}
            onChange={(e) =>
              onChange({
                ...filters,
                targetTable: e.target.value || undefined,
                page: 0,
              })
            }
            sx={filterTextFieldSx}
          />
          <TextField
            size="small"
            label="Target ID"
            value={filters.targetId || ""}
            onChange={(e) =>
              onChange({
                ...filters,
                targetId: e.target.value || undefined,
                page: 0,
              })
            }
            sx={filterTextFieldSx}
          />
          <TextField
            select
            size="small"
            label="Page Size"
            value={filters.size || 20}
            onChange={(e) =>
              onChange({ ...filters, size: Number(e.target.value), page: 0 })
            }
            sx={filterTextFieldSx}
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
            onChange={(e) =>
              onChange({
                ...filters,
                fromDate: e.target.value || undefined,
                page: 0,
              })
            }
            slotProps={{ inputLabel: { shrink: true } }}
            sx={filterTextFieldSx}
          />
          <TextField
            type="datetime-local"
            size="small"
            label="To Date"
            value={filters.toDate || ""}
            onChange={(e) =>
              onChange({
                ...filters,
                toDate: e.target.value || undefined,
                page: 0,
              })
            }
            slotProps={{ inputLabel: { shrink: true } }}
            sx={filterTextFieldSx}
          />
        </div>
      </Collapse>
    </section>
  );
};
