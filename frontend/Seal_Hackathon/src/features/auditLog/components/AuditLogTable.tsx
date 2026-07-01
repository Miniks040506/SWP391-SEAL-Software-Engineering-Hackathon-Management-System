import { format } from "date-fns";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { AuditLogResponse } from "@/types/system.types";

type Props = {
  logs: AuditLogResponse[];
  onViewDetail: (log: AuditLogResponse) => void;
};

const getActionColor = (action: string) => {
  if (action.includes("EVENT") || action.includes("ROUND")) return "secondary";
  if (action.includes("TEAM") || action.includes("MEMBER")) return "primary";
  if (action.includes("FAILED") || action.includes("DISQUALIFIED")) return "error";
  if (action.includes("SUBMISSION") || action.includes("ASSIGNED") || action.includes("PUBLISHED")) return "success";
  if (action.includes("SCORE") || action.includes("RANKING")) return "warning";
  if (action.includes("PRIZE")) return "info";
  return "default";
};

export const AuditLogTable = ({ logs, onViewDetail }: Props) => {
  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-700">
        No audit logs found matching your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="p-4 font-extrabold">Time</th>
            <th className="p-4 font-extrabold">Actor</th>
            <th className="p-4 font-extrabold">Action Type</th>
            <th className="p-4 font-extrabold">Target</th>
            <th className="p-4 font-extrabold text-right">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {logs.map((log) => (
            <tr key={log.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="p-4 whitespace-nowrap font-medium">
                {format(new Date(log.createdAt), "MMM dd HH:mm:ss")}
              </td>
              <td className="p-4">
                <p className="font-bold text-slate-900 dark:text-white">{log.actorName || "System"}</p>
                {log.actorId && <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]" title={log.actorId}>{log.actorId}</p>}
              </td>
              <td className="p-4">
                <Chip 
                  label={log.actionType.replace(/_/g, " ")} 
                  size="small" 
                  color={getActionColor(log.actionType) as any} 
                  variant="outlined" 
                  sx={{ fontWeight: 800, fontSize: "10px" }}
                />
              </td>
              <td className="p-4">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{log.targetTable}</span>
                {log.targetId && <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[150px]" title={log.targetId}>{log.targetId}</p>}
              </td>
              <td className="p-4 text-right">
                <Button 
                  size="small" 
                  variant="outlined"
                  startIcon={<VisibilityOutlinedIcon />}
                  onClick={() => onViewDetail(log)}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  View State
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};