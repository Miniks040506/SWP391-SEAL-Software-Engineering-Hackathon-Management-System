import { useState } from "react";
import { MenuItem, Pagination, Skeleton, TextField } from "@mui/material";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";

import { AdminOperationsHeader } from "@/features/admin/components/AdminOperationsHeader";
import {
  filterTextFieldSx,
  paginationSx,
} from "@/features/admin/schemas/admin.schema";
import { useAiSafetyLogsQuery } from "@/features/assistant/hooks/useAssistantAdminQueries";
import type {
  AiSafetyDecision,
  AiSafetyLogResponse,
} from "@/types/assistant.types";

const decisionOptions: Array<"" | AiSafetyDecision> = [
  "",
  "ALLOW",
  "WARN",
  "BLOCK",
];

function decisionClassName(decision: AiSafetyDecision) {
  if (decision === "BLOCK")
    return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300";
  if (decision === "WARN")
    return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
}

function severityClassName(severity: number) {
  if (severity >= 7) return "text-rose-600 dark:text-rose-300";
  if (severity >= 4) return "text-amber-600 dark:text-amber-300";
  return "text-emerald-600 dark:text-emerald-300";
}

function countDecision(
  logs: AiSafetyLogResponse[],
  decision: AiSafetyDecision,
) {
  return logs.filter((log) => log.decision === decision).length;
}

export function AdminAiSafetyLogsPage() {
  const [decision, setDecision] = useState<"" | AiSafetyDecision>("");
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching, isError, refetch } =
    useAiSafetyLogsQuery({
      decision: decision || undefined,
      page,
      size: 30,
    });

  const logs = data?.content ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminOperationsHeader
        eyebrow="Administration Workspace"
        title="AI Safety"
        accentTitle="Logs"
        description="Review assistant guardrail decisions across academic integrity, private data, prompt injection and unsupported requests."
        icon={<ShieldOutlinedIcon sx={{ fontSize: 34 }} />}
        actions={
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-900 shadow-lg transition-transform hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            <RefreshOutlinedIcon sx={{ fontSize: 18 }} />
            {isFetching ? "Refreshing" : "Refresh"}
          </button>
        }
      />

      <section className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white sm:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
        {[
          ["Total records", data?.totalElements ?? 0],
          ["Allowed on page", countDecision(logs, "ALLOW")],
          ["Warnings on page", countDecision(logs, "WARN")],
          ["Blocked on page", countDecision(logs, "BLOCK")],
        ].map(([label, value], index) => (
          <div
            key={label}
            className={`px-5 py-4 ${index ? "border-t border-slate-200 sm:border-t-0 sm:border-l dark:border-slate-800" : ""}`}
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {label}
            </p>
            <p className="mt-1 text-2xl font-black text-slate-950 tabular-nums dark:text-white">
              {isLoading ? "-" : value}
            </p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
              <FilterAltOutlinedIcon sx={{ fontSize: 20 }} />
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              Decision filter
            </span>
          </div>
          <TextField
            select
            label="Decision"
            value={decision}
            onChange={(event) => {
              setDecision(event.target.value as "" | AiSafetyDecision);
              setPage(0);
            }}
            size="small"
            sx={{ minWidth: 220, ...filterTextFieldSx }}
          >
            {decisionOptions.map((option) => (
              <MenuItem key={option || "ALL"} value={option}>
                {option || "All decisions"}
              </MenuItem>
            ))}
          </TextField>
        </div>
        <span className="self-start rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 tabular-nums sm:self-auto dark:bg-slate-800 dark:text-slate-300">
          {data?.totalElements ?? 0} records
        </span>
      </section>

      {isLoading ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-6 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/60">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="text"
                width="70%"
                className="dark:bg-slate-700"
              />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-6 gap-4 border-b border-slate-100 px-5 py-5 last:border-0 dark:border-slate-800"
            >
              {Array.from({ length: 6 }).map((__, cell) => (
                <Skeleton
                  key={cell}
                  variant="text"
                  width={cell === 5 ? "90%" : "65%"}
                  className="dark:bg-slate-800"
                />
              ))}
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Could not load AI safety logs. Refresh the page to try again.
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
          <ShieldOutlinedIcon
            sx={{ fontSize: 36 }}
            className="text-slate-400"
          />
          <p className="mt-3 font-bold text-slate-700 dark:text-slate-200">
            No safety logs match this filter
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Change the decision filter or refresh after new assistant activity.
          </p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/60">
                <tr className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-4">Time</th>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Decision</th>
                  <th className="px-5 py-4">Risk and intent</th>
                  <th className="px-5 py-4">Severity</th>
                  <th className="px-5 py-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="align-top transition-colors hover:bg-blue-50/30 dark:hover:bg-slate-800/40"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="min-w-[150px] px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {log.userName ?? log.userId ?? "System"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${decisionClassName(log.decision)}`}
                      >
                        {log.decision}
                      </span>
                    </td>
                    <td className="min-w-[190px] px-5 py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {log.riskType}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {log.intent || "Intent not classified"}
                      </p>
                    </td>
                    <td
                      className={`px-5 py-4 font-mono font-black tabular-nums ${severityClassName(log.severity)}`}
                    >
                      {log.severity}
                    </td>
                    <td className="max-w-md px-5 py-4 leading-relaxed text-slate-500 dark:text-slate-400">
                      {log.reason || "No reason recorded"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing {data.page * data.size + 1}-
                {Math.min((data.page + 1) * data.size, data.totalElements)} of{" "}
                {data.totalElements} logs
              </span>
              <Pagination
                count={data.totalPages}
                page={data.page + 1}
                onChange={(_, nextPage) => setPage(nextPage - 1)}
                size="small"
                shape="rounded"
                variant="outlined"
                sx={paginationSx}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
