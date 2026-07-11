import type { ReactNode } from "react";
import { Alert, Button, Card, CardContent, Chip, CircularProgress } from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";

import { useSystemHealthQuery } from "@/features/system/hooks/useSystemQueries";

function HealthCard({ title, ok, icon }: { title: string; ok: boolean; icon: ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">{icon}</div>
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-xl font-black text-slate-950 dark:text-white">{ok ? "Healthy" : "Issue"}</p>
          </div>
        </div>
        <Chip color={ok ? "success" : "error"} label={ok ? "UP" : "DOWN"} />
      </CardContent>
    </Card>
  );
}

export function AdminSystemHealthPage() {
  const { data, isLoading, isError, refetch, isFetching } = useSystemHealthQuery();

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black text-slate-950 dark:text-white">
            <HealthAndSafetyOutlinedIcon color="primary" fontSize="large" />
            System Health
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Monitor runtime dependencies used by SystemConfig, notifications, reminders and assistant support.
          </p>
        </div>
        <Button variant="outlined" startIcon={<RefreshOutlinedIcon />} disabled={isFetching} onClick={() => refetch()}>
          Refresh
        </Button>
      </header>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <CircularProgress />
        </div>
      ) : isError || !data ? (
        <Alert severity="error">Could not load system health.</Alert>
      ) : (
        <>
          <Alert severity={data.status === "UP" ? "success" : "warning"}>
            Overall system status: <strong>{data.status}</strong>
          </Alert>
          <div className="grid gap-4 md:grid-cols-3">
            <HealthCard title="Database" ok={data.databaseUp} icon={<StorageOutlinedIcon />} />
            <HealthCard title="Mail" ok={data.mailUp} icon={<MailOutlineOutlinedIcon />} />
            <HealthCard title="Storage" ok={data.storageUp} icon={<CloudOutlinedIcon />} />
          </div>
          <Card>
            <CardContent>
              <h2 className="mb-3 text-lg font-black text-slate-950 dark:text-white">Details</h2>
              <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
                {JSON.stringify(data.details ?? {}, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
