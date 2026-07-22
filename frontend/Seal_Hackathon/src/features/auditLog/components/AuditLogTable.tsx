import { format } from "date-fns";
import Chip from "@mui/material/Chip";
import type { ChipProps } from "@mui/material/Chip";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { AuditLogResponse } from "@/types/system.types";

type Props = {
  logs: AuditLogResponse[];
  onViewDetail: (log: AuditLogResponse) => void;
};

const getActionColor = (action: string): ChipProps["color"] => {
  if (action.includes("EVENT") || action.includes("ROUND")) return "secondary";
  if (action.includes("TEAM") || action.includes("MEMBER")) return "primary";
  if (action.includes("FAILED") || action.includes("DISQUALIFIED"))
    return "error";
  if (
    action.includes("SUBMISSION") ||
    action.includes("ASSIGNED") ||
    action.includes("PUBLISHED")
  )
    return "success";
  if (action.includes("SCORE") || action.includes("RANKING")) return "warning";
  if (action.includes("PRIZE")) return "info";
  return "default";
};

export const AuditLogTable = ({ logs, onViewDetail }: Props) => {
  if (logs.length === 0) {
    return (
      <div className="m-5 rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
        <p className="font-bold text-slate-700 dark:text-slate-200">
          No audit logs found
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Change or clear the current filters to broaden the results.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
        <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
          <tr>
            <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.12em]">
              Time
            </th>
            <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.12em]">
              Actor
            </th>
            <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.12em]">
              Action type
            </th>
            <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-[0.12em]">
              Target
            </th>
            <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-[0.12em]">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {logs.map((log) => (
            <tr
              key={log.id}
              className="transition-colors hover:bg-blue-50/40 dark:hover:bg-slate-800/50"
            >
              <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-semibold tabular-nums">
                {format(new Date(log.createdAt), "MMM dd HH:mm:ss")}
              </td>
              <td className="px-5 py-4">
                <p className="font-bold text-slate-900 dark:text-white">
                  {log.actorName || "System"}
                </p>
                {log.actorId && (
                  <p
                    className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]"
                    title={log.actorId}
                  >
                    {log.actorId}
                  </p>
                )}
              </td>
              <td className="px-5 py-4">
                <Chip
                  label={log.actionType.replace(/_/g, " ")}
                  size="small"
                  color={getActionColor(log.actionType)}
                  variant="outlined"
                  sx={{ fontWeight: 800, fontSize: "10px" }}
                />
              </td>
              <td className="px-5 py-4">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {log.targetTable}
                </span>
                {log.targetId && (
                  <p
                    className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[150px]"
                    title={log.targetId}
                  >
                    {log.targetId}
                  </p>
                )}
              </td>
              <td className="px-5 py-4 text-right">
                <button
                  type="button"
                  onClick={() => onViewDetail(log)}
                  className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-[0.98] dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10 dark:hover:text-blue-300 motion-reduce:active:scale-100"
                >
                  <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                  View State
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
