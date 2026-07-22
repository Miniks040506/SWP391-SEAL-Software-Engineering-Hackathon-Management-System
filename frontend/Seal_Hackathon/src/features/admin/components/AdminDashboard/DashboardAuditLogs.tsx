import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { AuditLogEntry } from "@/types/user.types";

function getLogDotColor(type: AuditLogEntry["type"]) {
  switch (type) {
    case "AUTH":
      return "bg-blue-500";
    case "SYSTEM":
      return "bg-purple-500";
    case "UPDATE":
      return "bg-orange-500";
    default:
      return "bg-green-500";
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
    <section className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
            <HistoryOutlinedIcon
              className="text-violet-500"
              sx={{ fontSize: 20 }}
            />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Audit Logs
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Recent system events.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/auditLogs")}
          className="inline-flex cursor-pointer items-center gap-1 self-start rounded-lg px-2 py-1 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-400 dark:hover:bg-blue-500/10"
        >
          View Full Logs
          <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800"
            >
              <Skeleton
                variant="text"
                width={120}
                height={16}
                className="dark:bg-slate-600 mt-1"
              />
              <Skeleton
                variant="text"
                width={180}
                height={20}
                className="dark:bg-slate-600 mt-1"
              />
              <Skeleton
                variant="text"
                width="90%"
                height={16}
                className="dark:bg-slate-600 mt-1"
              />
            </div>
          ))
        ) : auditLogs.length === 0 ? (
          <p className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center text-sm text-slate-400 dark:border-slate-700">
            No audit logs available.
          </p>
        ) : (
          auditLogs.slice(0, 2).map((log) => (
            <div
              key={log.id}
              className="relative rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div
                className={`absolute left-0 top-4 h-8 w-1 rounded-r-full ${getLogDotColor(log.type)}`}
              />
              <p className="pl-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {new Date(log.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                • {log.actor}
              </p>
              <h3 className="mt-1 pl-2 text-sm font-bold text-slate-900 dark:text-white">
                {log.action}
              </h3>
              <p className="mt-1 pl-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {log.details}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
