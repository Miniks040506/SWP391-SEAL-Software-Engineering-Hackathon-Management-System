import { useState } from "react";
import { useLocation } from "react-router-dom";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { Pagination, Skeleton } from "@mui/material";

import {
  useCoordinatorAuditLogsQuery,
  useAdminAuditLogsQuery,
  useAuditLogActionsQuery,
} from "../hooks/useAuditLogs";
import { AuditLogFilterBar } from "../components/AuditLogFilterBar";
import { AuditLogTable } from "../components/AuditLogTable";
import { AuditLogDetailDrawer } from "../components/AuditLogDetailDrawer";
import { AdminOperationsHeader } from "@/features/admin/components/AdminOperationsHeader";
import { paginationSx } from "@/features/admin/schemas/admin.schema";
import type {
  GetAuditLogsParams,
  AuditLogResponse,
} from "@/types/system.types";

export const AuditLogsPage = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const role = isAdmin ? "admin" : "coordinator";

  const [filters, setFilters] = useState<GetAuditLogsParams>({
    page: 0,
    size: 20,
  });
  const [selectedLog, setSelectedLog] = useState<AuditLogResponse | null>(null);

  const coordinatorQuery = useCoordinatorAuditLogsQuery(
    role === "coordinator" ? filters : undefined,
  );
  const adminQuery = useAdminAuditLogsQuery(
    role === "admin" ? filters : undefined,
  );

  const activeQuery = role === "admin" ? adminQuery : coordinatorQuery;
  const {
    data: logsRes,
    isLoading: logsLoading,
    isFetching,
    isError,
    refetch,
  } = activeQuery;
  const { data: actionsRes } = useAuditLogActionsQuery();

  const pageData = logsRes?.data || logsRes;
  const logs = pageData?.content || [];
  const total = pageData?.totalElements ?? logs.length;
  const totalPages = pageData?.totalPages ?? 0;
  const currentPage = pageData?.page ?? filters.page ?? 0;
  const availableActions = (actionsRes?.data || actionsRes || []) as string[];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminOperationsHeader
        eyebrow={isAdmin ? "Administration Workspace" : "Coordinator Workspace"}
        title="Audit"
        accentTitle="Logs"
        description={`Review accountable system activity across scoring, rankings, teams and exports. ${total} records found.`}
        icon={<ManageSearchOutlinedIcon sx={{ fontSize: 34 }} />}
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

      <AuditLogFilterBar
        filters={filters}
        onChange={setFilters}
        availableActions={availableActions}
      />

      {logsLoading ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-5 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/60">
            {Array.from({ length: 5 }).map((_, index) => (
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
              className="grid grid-cols-5 gap-4 border-b border-slate-100 px-5 py-5 last:border-0 dark:border-slate-800"
            >
              {Array.from({ length: 5 }).map((__, cell) => (
                <Skeleton
                  key={cell}
                  variant="text"
                  width={cell === 2 ? "85%" : "65%"}
                  className="dark:bg-slate-800"
                />
              ))}
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Could not load audit logs. Refresh the page to try again.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <AuditLogTable logs={logs} onViewDetail={setSelectedLog} />
          {totalPages > 1 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing {currentPage * (filters.size ?? 20) + 1}-
                {Math.min((currentPage + 1) * (filters.size ?? 20), total)} of{" "}
                {total} logs
              </span>
              <Pagination
                count={totalPages}
                page={currentPage + 1}
                onChange={(_, page) =>
                  setFilters((current) => ({ ...current, page: page - 1 }))
                }
                size="small"
                shape="rounded"
                variant="outlined"
                sx={paginationSx}
              />
            </div>
          )}
        </div>
      )}

      <AuditLogDetailDrawer
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};

export default AuditLogsPage;
