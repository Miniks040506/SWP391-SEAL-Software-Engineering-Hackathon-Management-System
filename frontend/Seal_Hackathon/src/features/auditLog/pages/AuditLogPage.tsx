import { useState } from "react";
import { useLocation } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

import {
  useCoordinatorAuditLogsQuery,
  useAdminAuditLogsQuery,
  useAuditLogActionsQuery,
} from "../hooks/useAuditLogs";
import { AuditLogFilterBar } from "../components/AuditLogFilterBar";
import { AuditLogTable } from "../components/AuditLogTable";
import { AuditLogDetailDrawer } from "../components/AuditLogDetailDrawer";
import type { GetAuditLogsParams, AuditLogResponse } from "@/types/system.types";

export const AuditLogsPage = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const role = isAdmin ? "admin" : "coordinator";

  const [filters, setFilters] = useState<GetAuditLogsParams>({
    page: 0,
    size: 20,
  });
  const [selectedLog, setSelectedLog] = useState<AuditLogResponse | null>(null);

  const coordinatorQuery = useCoordinatorAuditLogsQuery(role === "coordinator" ? filters : undefined);
  const adminQuery = useAdminAuditLogsQuery(role === "admin" ? filters : undefined);
  
  const { data: logsRes, isLoading: logsLoading } = role === "admin" ? adminQuery : coordinatorQuery;
  const { data: actionsRes } = useAuditLogActionsQuery();

  const logs = logsRes?.data?.content || (logsRes as any)?.content || [];
  const availableActions = actionsRes?.data || (actionsRes as any) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-4">
      <header className="flex items-center gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white">
            Audit Logs
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Track important system actions across scoring, ranking, disqualification and exports.
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

      <AuditLogDetailDrawer
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};

export default AuditLogsPage;
