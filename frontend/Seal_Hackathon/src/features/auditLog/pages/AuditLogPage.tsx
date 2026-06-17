import { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

import {
  useAuditLogsQuery,
  useAuditLogActionsQuery,
} from "../hooks/useAuditLogs";
import { AuditLogFilterBar } from "../components/AuditLogFilterBar";
import { AuditLogTable } from "../components/AuditLogTable";
import { AuditLogDetailModal } from "../components/AuditLogDetailModal";
import type {
  GetAuditLogsParams,
  AuditLogResponse,
} from "@/types/system.types";

export const AuditLogsPage = () => {
  const [filters, setFilters] = useState<GetAuditLogsParams>({
    page: 0,
    size: 20,
  });
  const [selectedLog, setSelectedLog] = useState<AuditLogResponse | null>(null);

  const { data: logsRes, isLoading: logsLoading } = useAuditLogsQuery(filters);
  const { data: actionsRes } = useAuditLogActionsQuery();

  const logs = logsRes?.data?.content || (logsRes as any)?.content || [];
  const availableActions = actionsRes?.data || (actionsRes as any) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-4">
      <header className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <HistoryOutlinedIcon />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white">
            System Audit Logs
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Monitor and trace system activities, user actions, and data changes.
          </p>
        </div>
      </header>

      <AuditLogFilterBar
        filters={filters}
        onChange={setFilters}
        availableActions={availableActions}
      />

      {logsLoading ? (
        <div className="flex justify-center py-24">
          <CircularProgress />
        </div>
      ) : (
        <AuditLogTable logs={logs} onViewDetail={setSelectedLog} />
      )}

      <AuditLogDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};

export default AuditLogsPage;
