import { Button, Card, CardContent, Skeleton } from "@mui/material";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import { useNavigate } from "react-router-dom";
import type { AuditLogEntry } from "@/types/user.types";

function getLogDotColor(type: AuditLogEntry["type"]) {
  switch (type) {
    case "AUTH": return "bg-blue-500";
    case "SYSTEM": return "bg-purple-500";
    case "UPDATE": return "bg-orange-500";
    default: return "bg-green-500";
  }
}

export function DashboardAuditLogs({
  auditLogs,
  isLoading,
}: {
  auditLogs: AuditLogEntry[];
  isLoading?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <Card
      variant="outlined"
      className="border-slate-100 dark:border-slate-700 bg-white! dark:bg-slate-800! shadow-sm rounded-xl h-full"
    >
      <CardContent className="p-6 flex flex-col h-full">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-slate-100">
              Audit Logs
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Recent system events.
            </p>
          </div>
          <Button
            variant="text"
            size="small"
            endIcon={<ArrowForwardOutlinedIcon fontSize="small" />}
            className="text-slate-500! dark:text-slate-400! hover:bg-slate-50! dark:hover:bg-slate-700/50! font-semibold! normal-case! tracking-normal!"
            onClick={() => navigate("/admin/audit-logs")}
          >
            View Full Logs
          </Button>
        </div>

        <div className="flex-1 space-y-6">
          {isLoading ? (
            // Skeleton entries while fetching
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="pl-4 border-l border-slate-200 dark:border-slate-700">
                <Skeleton variant="text" width={120} height={16} className="dark:bg-slate-600 mt-1" />
                <Skeleton variant="text" width={180} height={20} className="dark:bg-slate-600 mt-1" />
                <Skeleton variant="text" width="90%" height={16} className="dark:bg-slate-600 mt-1" />
              </div>
            ))
          ) : auditLogs.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">
              No audit logs available.
            </p>
          ) : (
            auditLogs.slice(0, 2).map((log) => (
              <div
                key={log.id}
                className="relative border-l border-slate-200 dark:border-slate-700 pl-4"
              >
                <div
                  className={`absolute -left-1.25 top-1.5 h-2 w-2 rounded-full ${getLogDotColor(log.type)}`}
                />
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  • {log.actor}
                </p>
                <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                  {log.action}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {log.details}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}